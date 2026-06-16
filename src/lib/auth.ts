import { create } from "zustand";
import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

interface AuthStore {
  user: User | null;
  loading: boolean;
  init: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user ?? null, loading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null });
    });
  },

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
