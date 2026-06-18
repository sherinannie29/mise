"use client";

import { Clock, Users } from "lucide-react";
import type { Recipe } from "@/lib/types";

export function RecipeCard({ recipe, onClick }: { recipe: Recipe; onClick: () => void }) {
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <button
      onClick={onClick}
      className="group text-left w-full h-full rounded-2xl p-5 transition-all hover:scale-[1.01] flex flex-col"
      style={{
        background: "rgba(255, 255, 255, 0.65)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-[#111827] text-base leading-snug group-hover:text-[#2d6a4f] transition-colors" style={{ fontFamily: "Georgia, serif" }}>
          {recipe.title}
        </h3>
        <span className="shrink-0 text-xs text-[#6b7280] bg-white/60 px-2 py-0.5 rounded-full">
          {recipe.cuisine}
        </span>
      </div>
      <p className="text-sm text-[#374151] line-clamp-2 mb-4 flex-1">{recipe.description}</p>
      <div className="flex items-center gap-4 text-xs text-[#4b5563]">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {totalTime} min
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} />
          {recipe.servings}
        </span>
        {recipe.cooked > 0 && (
          <span className="ml-auto text-[#40916c] font-medium">
            Cooked {recipe.cooked}×
          </span>
        )}
      </div>
      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {recipe.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs text-[#40916c] bg-[#d8f3dc]/70 px-2.5 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
