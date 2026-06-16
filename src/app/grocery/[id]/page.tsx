"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, UserPlus, X } from "lucide-react";
import { useGroceryStore, GroceryItem, GroceryCollaborator } from "@/lib/grocery";
import { useAuthStore } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function GroceryListPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { lists, getListItems, addItem, toggleItem, deleteItem, getCollaborators, addCollaborator, removeCollaborator } = useGroceryStore();

  const list = lists.find((l) => l.id === id);

  const [items, setItems] = useState<GroceryItem[]>([]);
  const [collaborators, setCollaborators] = useState<GroceryCollaborator[]>([]);
  const [newItem, setNewItem] = useState("");
  const [addingItem, setAddingItem] = useState(false);
  const [showCollabInput, setShowCollabInput] = useState(false);
  const [collabEmail, setCollabEmail] = useState("");
  const [collabError, setCollabError] = useState("");
  const [addingCollab, setAddingCollab] = useState(false);

  const loadData = useCallback(async () => {
    const [fetchedItems, fetchedCollabs] = await Promise.all([
      getListItems(id),
      getCollaborators(id),
    ]);
    setItems(fetchedItems);
    setCollaborators(fetchedCollabs);
  }, [id]);

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel(`grocery-items-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "grocery_items", filter: `list_id=eq.${id}` }, () => {
        loadData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, loadData]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setAddingItem(true);
    const item = await addItem(id, newItem.trim());
    if (item) setItems((prev) => [...prev, item]);
    setNewItem("");
    setAddingItem(false);
  };

  const handleToggle = async (item: GroceryItem) => {
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, checked: !i.checked } : i));
    await toggleItem(item);
  };

  const handleDeleteItem = async (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    await deleteItem(itemId);
  };

  const handleAddCollab = async (e: React.FormEvent) => {
    e.preventDefault();
    setCollabError("");
    setAddingCollab(true);
    const result = await addCollaborator(id, collabEmail.trim());
    if (result.error) {
      setCollabError(result.error);
    } else {
      setCollabEmail("");
      setShowCollabInput(false);
      const updatedCollabs = await getCollaborators(id);
      setCollaborators(updatedCollabs);
    }
    setAddingCollab(false);
  };

  const handleRemoveCollab = async (userId: string) => {
    await removeCollaborator(id, userId);
    setCollaborators((prev) => prev.filter((c) => c.userId !== userId));
  };

  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);
  const isOwner = list?.ownerId === user?.id;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button
        onClick={() => router.push("/grocery")}
        className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#0d0d0d] mb-6 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to lists
      </button>

      <div className="flex items-start justify-between mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-[#0d0d0d]">
          {list?.name ?? "Grocery list"}
        </h1>
        {isOwner && (
          <button
            onClick={() => setShowCollabInput(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[#e5e7eb] rounded-xl text-[#6b7280] hover:border-[#2d6a4f] hover:text-[#2d6a4f] transition-colors"
          >
            <UserPlus size={14} />
            Add collaborator
          </button>
        )}
      </div>

      {/* Collaborators */}
      {collaborators.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {collaborators.map((c) => (
            <div key={c.userId} className="group flex items-center gap-1.5 px-3 py-1 bg-[#f0fdf4] border border-[#d1fae5] rounded-full text-xs text-[#2d6a4f]">
              <span>{c.fullName ?? c.email}</span>
              {isOwner && (
                <button onClick={() => handleRemoveCollab(c.userId)} className="opacity-0 group-hover:opacity-100 ml-0.5 transition-opacity">
                  <X size={11} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showCollabInput && (
        <form onSubmit={handleAddCollab} className="mb-6 p-4 border border-[#e5e7eb] rounded-2xl bg-white">
          <p className="text-sm font-medium text-[#0d0d0d] mb-3">Add a collaborator</p>
          <div className="flex gap-2">
            <input
              autoFocus
              type="email"
              placeholder="friend@email.com"
              value={collabEmail}
              onChange={(e) => { setCollabEmail(e.target.value); setCollabError(""); }}
              className="flex-1 px-4 py-2 text-sm border border-[#e5e7eb] rounded-xl bg-[#fdf8f0] focus:outline-none focus:border-[#2d6a4f]"
            />
            <button
              type="submit"
              disabled={addingCollab}
              className="px-4 py-2 bg-[#2d6a4f] text-white text-sm rounded-xl hover:bg-[#1b4332] transition-colors disabled:opacity-50"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => { setShowCollabInput(false); setCollabEmail(""); setCollabError(""); }}
              className="px-3 py-2 border border-[#e5e7eb] text-[#6b7280] text-sm rounded-xl hover:bg-[#f3f4f6] transition-colors"
            >
              Cancel
            </button>
          </div>
          {collabError && <p className="text-xs text-red-500 mt-2">{collabError}</p>}
        </form>
      )}

      {/* Add item form */}
      <form onSubmit={handleAddItem} className="flex gap-2 mb-8">
        <input
          type="text"
          placeholder="Add an item…"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="flex-1 px-4 py-2.5 text-sm border border-[#e5e7eb] rounded-xl bg-[#fdf8f0] focus:outline-none focus:border-[#2d6a4f]"
        />
        <button
          type="submit"
          disabled={addingItem || !newItem.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#2d6a4f] text-white text-sm rounded-xl hover:bg-[#1b4332] transition-colors disabled:opacity-40"
        >
          <Plus size={15} />
          Add
        </button>
      </form>

      {/* Items */}
      {items.length === 0 ? (
        <p className="text-center text-sm text-[#9ca3af] py-12">No items yet — add something above.</p>
      ) : (
        <>
          {unchecked.length > 0 && (
            <div className="flex flex-col gap-1 mb-6">
              {unchecked.map((item) => (
                <ItemRow key={item.id} item={item} onToggle={handleToggle} onDelete={handleDeleteItem} />
              ))}
            </div>
          )}
          {checked.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[#9ca3af] uppercase tracking-wider mb-2">Done ({checked.length})</p>
              <div className="flex flex-col gap-1">
                {checked.map((item) => (
                  <ItemRow key={item.id} item={item} onToggle={handleToggle} onDelete={handleDeleteItem} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ItemRow({ item, onToggle, onDelete }: { item: GroceryItem; onToggle: (i: GroceryItem) => void; onDelete: (id: string) => void }) {
  return (
    <div className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#f9f6f0] transition-colors">
      <button
        onClick={() => onToggle(item)}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${item.checked ? "bg-[#2d6a4f] border-[#2d6a4f]" : "border-[#d1d5db] hover:border-[#2d6a4f]"}`}
      >
        {item.checked && (
          <svg viewBox="0 0 20 20" fill="white" className="w-full h-full p-0.5">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      <span className={`flex-1 text-sm ${item.checked ? "line-through text-[#9ca3af]" : "text-[#0d0d0d]"}`}>
        {item.name}
      </span>
      <button
        onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-[#9ca3af] hover:text-red-500 transition-all"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
