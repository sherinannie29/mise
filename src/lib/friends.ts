import { create } from "zustand";
import { supabase } from "./supabase";
import type { Friendship, Profile, Recipe } from "./types";

interface FriendsStore {
  friends: Friendship[];
  pending: Friendship[];
  sent: Friendship[];
  loading: boolean;
  fetchFriends: () => Promise<void>;
  sendRequest: (email: string) => Promise<{ error?: string }>;
  cancelRequest: (friendshipId: string) => Promise<void>;
  acceptRequest: (friendshipId: string) => Promise<void>;
  declineRequest: (friendshipId: string) => Promise<void>;
  removeFriend: (friendshipId: string) => Promise<void>;
  getFriendRecipes: (friendId: string) => Promise<Recipe[]>;
  getFriendProfile: (friendId: string) => Promise<Profile | null>;
}

export const useFriendsStore = create<FriendsStore>((set, get) => ({
  friends: [],
  pending: [],
  sent: [],
  loading: false,

  fetchFriends: async () => {
    set({ loading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("friendships")
      .select("*, requester:profiles!friendships_requester_id_fkey(id,email,full_name,avatar_url), receiver:profiles!friendships_receiver_id_fkey(id,email,full_name,avatar_url)")
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (!data) { set({ loading: false }); return; }

    const friends: Friendship[] = [];
    const pending: Friendship[] = [];
    const sent: Friendship[] = [];

    for (const row of data) {
      const isRequester = row.requester_id === user.id;
      const otherProfile = isRequester ? row.receiver : row.requester;
      const friendship: Friendship = {
        id: row.id,
        requesterId: row.requester_id,
        receiverId: row.receiver_id,
        status: row.status,
        createdAt: row.created_at,
        profile: otherProfile ? {
          id: otherProfile.id,
          email: otherProfile.email,
          fullName: otherProfile.full_name,
          avatarUrl: otherProfile.avatar_url,
        } : undefined,
      };
      if (row.status === "accepted") friends.push(friendship);
      else if (row.status === "pending" && row.receiver_id === user.id) pending.push(friendship);
      else if (row.status === "pending" && row.requester_id === user.id) sent.push(friendship);
    }

    set({ friends, pending, sent, loading: false });
  },

  sendRequest: async (email) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not logged in" };
    if (email === user.email) return { error: "You can't add yourself" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (!profile) return { error: "No user found with that email" };

    const existing = get().friends.find(f => f.profile?.id === profile.id);
    if (existing) return { error: "Already friends" };

    // Delete any existing pending request before reinserting (so webhook re-fires)
    await supabase.from("friendships")
      .delete()
      .eq("requester_id", user.id)
      .eq("receiver_id", profile.id)
      .eq("status", "pending");

    const { error } = await supabase.from("friendships").insert({
      requester_id: user.id,
      receiver_id: profile.id,
    });

    if (error) return { error: "Could not send request" };
    await get().fetchFriends();
    return {};
  },

  cancelRequest: async (friendshipId) => {
    await supabase.from("friendships").delete().eq("id", friendshipId);
    await get().fetchFriends();
  },

  acceptRequest: async (friendshipId) => {
    await supabase.from("friendships").update({ status: "accepted" }).eq("id", friendshipId);
    await get().fetchFriends();
  },

  declineRequest: async (friendshipId) => {
    await supabase.from("friendships").delete().eq("id", friendshipId);
    await get().fetchFriends();
  },

  removeFriend: async (friendshipId) => {
    await supabase.from("friendships").delete().eq("id", friendshipId);
    await get().fetchFriends();
  },

  getFriendRecipes: async (friendId) => {
    const { data } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", friendId)
      .eq("is_private", false)
      .order("created_at", { ascending: false });

    if (!data) return [];
    return data.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      cuisine: row.cuisine,
      tags: row.tags ?? [],
      ingredients: row.ingredients ?? [],
      steps: row.steps ?? [],
      prepTime: row.prep_time,
      cookTime: row.cook_time,
      servings: row.servings,
      createdAt: row.created_at,
      cooked: row.cooked ?? 0,
    }));
  },

  getFriendProfile: async (friendId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", friendId).single();
    if (!data) return null;
    return { id: data.id, email: data.email, fullName: data.full_name, avatarUrl: data.avatar_url };
  },
}));
