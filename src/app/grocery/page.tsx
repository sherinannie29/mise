"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ShoppingCart, Trash2, Pencil } from "lucide-react";
import { useGroceryStore } from "@/lib/grocery";
import { useAuthStore } from "@/lib/auth";

export default function GroceryPage() {
  const { lists, loading, fetchLists, createList, deleteList, renameList } = useGroceryStore();
  const user = useAuthStore((s) => s.user);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => { fetchLists(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    await createList(newName.trim());
    setNewName("");
    setShowInput(false);
    setCreating(false);
  };

  return (
    <div className="min-h-screen relative">
      <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=80" alt="" className="fixed inset-0 w-full h-full object-cover -z-10" style={{ filter: "blur(18px) brightness(0.7) saturate(0.8)", transform: "scale(1.15)" }} />
      <div className="fixed inset-0 -z-10" style={{ background: "rgba(5, 20, 10, 0.45)" }} />
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Grocery lists</h1>
          <p className="text-white/70 text-sm mt-1">{lists.length} list{lists.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowInput(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#2d6a4f] text-white text-sm rounded-xl hover:bg-[#1b4332] transition-colors"
        >
          <Plus size={15} />
          New list
        </button>
      </div>

      {showInput && (
        <form onSubmit={handleCreate} className="mb-6 flex gap-2">
          <input
            autoFocus
            type="text"
            placeholder="List name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 px-4 py-2.5 text-sm border border-[#e5e7eb] rounded-xl bg-[#fdf8f0] focus:outline-none focus:border-[#2d6a4f]"
          />
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2.5 bg-[#2d6a4f] text-white text-sm rounded-xl hover:bg-[#1b4332] transition-colors disabled:opacity-50"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => { setShowInput(false); setNewName(""); }}
            className="px-4 py-2.5 border border-[#e5e7eb] text-[#6b7280] text-sm rounded-xl hover:bg-[#f3f4f6] transition-colors"
          >
            Cancel
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-[#9ca3af] text-sm">Loading…</p>
      ) : lists.length === 0 ? (
        <div className="text-center py-20 text-[#9ca3af]">
          <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No grocery lists yet — create one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lists.map((list) => (
            <div
              key={list.id}
              className="group relative rounded-2xl overflow-hidden"
              style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", background: "rgba(255,255,255,0.80)", border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}
            >
              <Link href={`/grocery/${list.id}`} className="block px-6 pt-6 pb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(45,106,79,0.12)" }}>
                  <ShoppingCart size={18} style={{ color: "#2d6a4f" }} />
                </div>
                {editingId === list.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={async () => {
                      if (editName.trim() && editName.trim() !== list.name) await renameList(list.id, editName.trim());
                      setEditingId(null);
                    }}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") { e.currentTarget.blur(); }
                      if (e.key === "Escape") { setEditingId(null); }
                    }}
                    onClick={(e) => e.preventDefault()}
                    className="font-semibold text-[#111827] text-lg leading-tight bg-transparent border-b border-[#2d6a4f] focus:outline-none w-full"
                  />
                ) : (
                  <p className="font-semibold text-[#111827] text-lg leading-tight">{list.name}</p>
                )}
                {list.ownerId !== user?.id && (
                  <p className="text-xs text-[#6b7280] mt-1">Shared with you</p>
                )}
              </Link>
              {list.ownerId === user?.id && (
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={(e) => { e.preventDefault(); setEditingId(list.id); setEditName(list.name); }}
                    className="p-1.5 text-[#9ca3af] hover:text-[#2d6a4f] transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => deleteList(list.id)}
                    className="p-1.5 text-[#9ca3af] hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
