"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFriendsStore } from "@/lib/friends";
import { RecipeCard } from "@/components/RecipeCard";
import { ChevronLeft } from "lucide-react";
import type { Recipe } from "@/lib/types";
import type { Profile } from "@/lib/types";

export default function FriendRecipesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getFriendRecipes, getFriendProfile } = useFriendsStore();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getFriendRecipes(id), getFriendProfile(id)]).then(([r, p]) => {
      setRecipes(r);
      setProfile(p);
      setLoading(false);
    });
  }, [id]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#0d0d0d] mb-8 transition-colors"
      >
        <ChevronLeft size={16} />
        Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-[#0d0d0d] mb-1">
          {profile?.fullName ?? profile?.email ?? "Friend"}'s recipes
        </h1>
        <p className="text-[#6b7280] text-sm">{recipes.length} public recipes</p>
      </div>

      {loading ? (
        <p className="text-sm text-[#9ca3af]">Loading…</p>
      ) : recipes.length === 0 ? (
        <p className="text-sm text-[#9ca3af]">No public recipes yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} onClick={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}
