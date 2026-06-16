import { create } from "zustand";
import { supabase } from "./supabase";

export interface GroceryList {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  itemCount?: number;
}

export interface GroceryItem {
  id: string;
  listId: string;
  name: string;
  checked: boolean;
  addedBy: string;
  createdAt: string;
}

export interface GroceryCollaborator {
  userId: string;
  email: string;
  fullName: string | null;
}

interface GroceryStore {
  lists: GroceryList[];
  loading: boolean;
  fetchLists: () => Promise<void>;
  createList: (name: string) => Promise<GroceryList | null>;
  renameList: (id: string, name: string) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  getListItems: (listId: string) => Promise<GroceryItem[]>;
  addItem: (listId: string, name: string) => Promise<GroceryItem | null>;
  toggleItem: (item: GroceryItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getCollaborators: (listId: string) => Promise<GroceryCollaborator[]>;
  addCollaborator: (listId: string, email: string) => Promise<{ error?: string }>;
  removeCollaborator: (listId: string, userId: string) => Promise<void>;
}

export const useGroceryStore = create<GroceryStore>((set, get) => ({
  lists: [],
  loading: false,

  fetchLists: async () => {
    set({ loading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: owned } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    const { data: collab } = await supabase
      .from("grocery_list_collaborators")
      .select("list_id, grocery_lists(*)")
      .eq("user_id", user.id);

    const collabLists = (collab ?? [])
      .map((c: any) => c.grocery_lists)
      .filter(Boolean);

    const all = [...(owned ?? []), ...collabLists].map((l: any) => ({
      id: l.id,
      name: l.name,
      ownerId: l.owner_id,
      createdAt: l.created_at,
    }));

    set({ lists: all, loading: false });
  },

  createList: async (name) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from("grocery_lists")
      .insert({ name, owner_id: user.id })
      .select()
      .single();
    if (error || !data) return null;
    const list = { id: data.id, name: data.name, ownerId: data.owner_id, createdAt: data.created_at };
    set((s) => ({ lists: [list, ...s.lists] }));
    return list;
  },

  renameList: async (id, name) => {
    await supabase.from("grocery_lists").update({ name }).eq("id", id);
    set((s) => ({ lists: s.lists.map((l) => l.id === id ? { ...l, name } : l) }));
  },

  deleteList: async (id) => {
    await supabase.from("grocery_lists").delete().eq("id", id);
    set((s) => ({ lists: s.lists.filter((l) => l.id !== id) }));
  },

  getListItems: async (listId) => {
    const { data } = await supabase
      .from("grocery_items")
      .select("*")
      .eq("list_id", listId)
      .order("created_at", { ascending: true });
    return (data ?? []).map((i: any) => ({
      id: i.id, listId: i.list_id, name: i.name,
      checked: i.checked, addedBy: i.added_by, createdAt: i.created_at,
    }));
  },

  addItem: async (listId, name) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from("grocery_items")
      .insert({ list_id: listId, name, added_by: user.id })
      .select()
      .single();
    if (error || !data) return null;
    return { id: data.id, listId: data.list_id, name: data.name, checked: data.checked, addedBy: data.added_by, createdAt: data.created_at };
  },

  toggleItem: async (item) => {
    await supabase.from("grocery_items").update({ checked: !item.checked }).eq("id", item.id);
  },

  deleteItem: async (id) => {
    await supabase.from("grocery_items").delete().eq("id", id);
  },

  getCollaborators: async (listId) => {
    const { data } = await supabase
      .from("grocery_list_collaborators")
      .select("user_id, profiles(email, full_name)")
      .eq("list_id", listId);
    return (data ?? []).map((c: any) => ({
      userId: c.user_id,
      email: c.profiles?.email ?? "",
      fullName: c.profiles?.full_name ?? null,
    }));
  },

  addCollaborator: async (listId, email) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();
    if (!profile) return { error: "No user found with that email" };
    const { error } = await supabase
      .from("grocery_list_collaborators")
      .insert({ list_id: listId, user_id: profile.id });
    if (error) return { error: "Already a collaborator" };
    return {};
  },

  removeCollaborator: async (listId, userId) => {
    await supabase.from("grocery_list_collaborators")
      .delete().eq("list_id", listId).eq("user_id", userId);
  },
}));
