"use client";

import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import Link from "next/link";
import { useRecipeStore } from "@/lib/store";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeModal } from "@/components/RecipeModal";
import type { Recipe } from "@/lib/types";

export default function RecipesPage() {
  const recipes = useRecipeStore((s) => s.recipes);
  const loading = useRecipeStore((s) => s.loading);
  const fetchRecipes = useRecipeStore((s) => s.fetchRecipes);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Recipe | null>(null);

  useEffect(() => { fetchRecipes(); }, []);

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
    <>
      <div className="min-h-screen relative">
        <img
          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=80"
          alt=""
          className="fixed inset-0 w-full h-full object-cover -z-10"
          style={{ filter: "blur(18px) brightness(0.7) saturate(0.8)", transform: "scale(1.15)" }}
        />
        <div className="fixed inset-0 -z-10" style={{ background: "rgba(5, 20, 10, 0.45)" }} />

        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl tracking-tight text-white mb-1" style={{ fontFamily: "Georgia, serif", fontWeight: 700 }}>
                Your recipes
              </h1>
              <p className="text-white/70 text-sm">{recipes.length} recipes saved</p>
            </div>
            <Link
              href="/add"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2d6a4f] text-white text-sm rounded-xl hover:bg-[#1b4332] transition-colors"
            >
              <Plus size={15} />
              Add recipe
            </Link>
          </div>

          <div className="relative mb-4">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              placeholder="Search recipes, cuisines, tags…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl focus:outline-none transition-colors text-white placeholder-white/50 focus:ring-1 focus:ring-white/30"
              style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.3)" }}
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {cuisines.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === c
                    ? "bg-[#2d6a4f] text-white border border-[#2d6a4f]"
                    : "text-white/80 hover:bg-white/20 border border-white/30"
                }`}
              >
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-white/60 text-sm">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-white/60 text-sm">
              {query || filter !== "all" ? "No recipes match your search." : "No recipes yet — tap + Add to save your first one."}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r) => (
                <RecipeCard key={r.id} recipe={r} onClick={() => setSelected(r)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <RecipeModal recipe={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
