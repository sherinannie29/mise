"use client";

import Link from "next/link";
import { Clock, Users } from "lucide-react";
import type { Recipe } from "@/lib/types";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group block border border-[#e5e7eb] rounded-2xl p-5 hover:border-[#2d6a4f] hover:shadow-sm transition-all bg-[#fdf8f0]"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-medium text-[#0d0d0d] text-base leading-snug group-hover:text-[#2d6a4f] transition-colors">
          {recipe.title}
        </h3>
        <span className="shrink-0 text-xs text-[#6b7280] bg-[#f3f4f6] px-2 py-0.5 rounded-full">
          {recipe.cuisine}
        </span>
      </div>
      <p className="text-sm text-[#6b7280] line-clamp-2 mb-4">{recipe.description}</p>
      <div className="flex items-center gap-4 text-xs text-[#6b7280]">
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
            <span
              key={tag}
              className="text-xs text-[#40916c] bg-[#d8f3dc] px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
