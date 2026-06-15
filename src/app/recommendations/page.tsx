"use client";

import { useRecipeStore } from "@/lib/store";
import { RecipeCard } from "@/components/RecipeCard";
import { Sparkles } from "lucide-react";

export default function RecommendationsPage() {
  const getRecommendations = useRecipeStore((s) => s.getRecommendations);
  const cookLogs = useRecipeStore((s) => s.cookLogs);
  const recommendations = getRecommendations();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={20} className="text-[#2d6a4f]" />
          <h1 className="text-3xl font-semibold tracking-tight text-[#0d0d0d]">For you</h1>
        </div>
        <p className="text-[#6b7280] text-sm">
          {cookLogs.length === 0
            ? "Cook a few recipes and we'll start personalising these picks."
            : `Based on your ${cookLogs.length} cook${cookLogs.length > 1 ? "s" : ""} so far.`}
        </p>
      </div>

      {recommendations.length === 0 ? (
        <p className="text-[#9ca3af] text-sm">No recommendations yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      )}

      {cookLogs.length === 0 && (
        <div className="mt-12 p-6 border border-dashed border-[#e5e7eb] rounded-2xl text-center">
          <p className="text-sm text-[#9ca3af]">
            Head to any recipe and tap <span className="text-[#2d6a4f] font-medium">Mark as cooked</span> to train your recommendations.
          </p>
        </div>
      )}
    </div>
  );
}
