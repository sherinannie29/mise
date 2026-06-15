"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRecipeStore } from "@/lib/store";
import { RecipeCard } from "@/components/RecipeCard";

export default function Home() {
  const recipes = useRecipeStore((s) => s.recipes);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const cuisines = ["all", ...Array.from(new Set(recipes.map((r) => r.cuisine))).sort()];

  const filtered = recipes.filter((r) => {
    const matchesQuery =
      !query ||
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.tags.some((t) => t.includes(query.toLowerCase())) ||
      r.cuisine.toLowerCase().includes(query.toLowerCase());
    const matchesCuisine = filter === "all" || r.cuisine === filter;
    return matchesQuery && matchesCuisine;
  });

  return (
    <div>
      {/* Hero banner */}
      <div className="w-full h-72 sm:h-96 overflow-hidden relative">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-[#0d0d0d] mb-1">
          Your recipes
        </h1>
        <p className="text-[#6b7280] text-sm">{recipes.length} recipes saved</p>
      </div>

      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]"
        />
        <input
          type="text"
          placeholder="Search recipes, cuisines, tags…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#e5e7eb] rounded-xl bg-[#fdf8f0] focus:outline-none focus:border-[#2d6a4f] transition-colors"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {cuisines.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              filter === c
                ? "border-[#2d6a4f] bg-[#2d6a4f] text-white"
                : "border-[#e5e7eb] text-[#6b7280] hover:border-[#2d6a4f] hover:text-[#2d6a4f]"
            }`}
          >
            {c === "all" ? "All" : c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-[#9ca3af] text-sm">
        {query || filter !== "all" ? "No recipes match your search." : "No recipes yet — tap + Add to save your first one."}
      </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
