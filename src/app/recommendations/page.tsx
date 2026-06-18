"use client";

import { useState, useEffect } from "react";
import { useRecipeStore } from "@/lib/store";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeModal } from "@/components/RecipeModal";
import { Sparkles, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { refreshRecommendations } from "@/lib/recommendations";
import type { Recipe } from "@/lib/types";

function EditBeforeSaveModal({
  recipe,
  onSave,
  onClose,
}: {
  recipe: Recipe;
  onSave: (r: Recipe) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(recipe.title);
  const [description, setDescription] = useState(recipe.description);
  const [cuisine, setCuisine] = useState(recipe.cuisine);
  const [tagsStr, setTagsStr] = useState(recipe.tags.join(", "));
  const [ingredientsStr, setIngredientsStr] = useState(
    recipe.ingredients.map((i) => `${i.amount} ${i.unit} ${i.name}`.trim()).join("\n")
  );
  const [stepsStr, setStepsStr] = useState(recipe.steps.join("\n"));
  const [prepTime, setPrepTime] = useState(String(recipe.prepTime));
  const [cookTime, setCookTime] = useState(String(recipe.cookTime));
  const [servings, setServings] = useState(String(recipe.servings));

  const handleSave = () => {
    const parsedIngredients = ingredientsStr
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(/\s+/);
        const amount = parts[0] ?? "";
        const unit = parts[1] ?? "";
        const name = parts.slice(2).join(" ");
        return { amount, unit, name };
      });

    onSave({
      ...recipe,
      title,
      description,
      cuisine,
      tags: tagsStr.split(",").map((t) => t.trim()).filter(Boolean),
      ingredients: parsedIngredients,
      steps: stepsStr.split("\n").map((s) => s.trim()).filter(Boolean),
      prepTime: Number(prepTime) || recipe.prepTime,
      cookTime: Number(cookTime) || recipe.cookTime,
      servings: Number(servings) || recipe.servings,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" style={{ backdropFilter: "blur(4px)" }} />
      <div
        className="relative w-full sm:max-w-lg bg-[#fdf8f0] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/50 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#fdf8f0] px-6 pt-6 pb-4 border-b border-[#e5e7eb] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Edit before saving</h2>
            <p className="text-xs text-[#9ca3af] mt-0.5">Tweak the recipe before it goes into your collection</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#9ca3af] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-1 block">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] rounded-xl bg-white focus:outline-none focus:border-[#2d6a4f]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] rounded-xl bg-white focus:outline-none focus:border-[#2d6a4f] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-1 block">Cuisine</label>
              <input
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] rounded-xl bg-white focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-1 block">Tags (comma separated)</label>
              <input
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] rounded-xl bg-white focus:outline-none focus:border-[#2d6a4f]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-1 block">Prep (min)</label>
              <input type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] rounded-xl bg-white focus:outline-none focus:border-[#2d6a4f]" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-1 block">Cook (min)</label>
              <input type="number" value={cookTime} onChange={(e) => setCookTime(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] rounded-xl bg-white focus:outline-none focus:border-[#2d6a4f]" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-1 block">Servings</label>
              <input type="number" value={servings} onChange={(e) => setServings(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] rounded-xl bg-white focus:outline-none focus:border-[#2d6a4f]" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-1 block">Ingredients (one per line: amount unit name)</label>
            <textarea
              value={ingredientsStr}
              onChange={(e) => setIngredientsStr(e.target.value)}
              rows={6}
              className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] rounded-xl bg-white focus:outline-none focus:border-[#2d6a4f] resize-none font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-1 block">Steps (one per line)</label>
            <textarea
              value={stepsStr}
              onChange={(e) => setStepsStr(e.target.value)}
              rows={6}
              className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] rounded-xl bg-white focus:outline-none focus:border-[#2d6a4f] resize-none"
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 bg-[#2d6a4f] text-white text-sm rounded-xl hover:bg-[#1b4332] transition-colors"
          >
            Save to collection
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-[#e5e7eb] text-[#6b7280] text-sm rounded-xl hover:bg-[#f3f4f6] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const recipes = useRecipeStore((s) => s.recipes);
  const fetchRecipes = useRecipeStore((s) => s.fetchRecipes);
  const addRecipe = useRecipeStore((s) => s.addRecipe);

  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [editTarget, setEditTarget] = useState<Recipe | null>(null);

  useEffect(() => { if (recipes.length === 0) fetchRecipes(); }, []);

  useEffect(() => {
    if (recipes.length > 0) loadSuggestions();
  }, [recipes.length]);

  const loadSuggestions = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("recommendations")
      .select("suggestions, recipe_count")
      .eq("user_id", user.id)
      .single();

    if (data && data.suggestions?.length > 0) {
      setSuggestions(data.suggestions);
      if (data && data.recipe_count !== recipes.length) {
        refreshRecommendations(recipes, null);
      }
    } else {
      refreshRecommendations(recipes, null);
    }

    setLoading(false);
  };

  const handleSave = async (recipe: Recipe) => {
    await addRecipe({ ...recipe, id: crypto.randomUUID() });
    setSaved((prev) => new Set(prev).add(recipe.id));
    setEditTarget(null);
  };

  return (
    <div className="min-h-screen relative">
      <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=80" alt="" className="fixed inset-0 w-full h-full object-cover -z-10" style={{ filter: "blur(18px) brightness(0.7) saturate(0.8)", transform: "scale(1.15)" }} />
      <div className="fixed inset-0 -z-10" style={{ background: "rgba(5, 20, 10, 0.45)" }} />
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={20} className="text-[#2d6a4f]" />
          <h1 className="text-3xl tracking-tight text-white" style={{ fontFamily: "Georgia, serif", fontWeight: 700 }}>For you</h1>
        </div>
        <p className="text-white/70 text-sm">AI-picked recipes based on what you cook.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-[#f3f4f6] animate-pulse" />
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#e5e7eb] rounded-2xl">
          <Sparkles size={32} className="text-[#d1d5db] mx-auto mb-3" />
          <p className="text-sm text-[#9ca3af]">Add some recipes to get personalised suggestions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {suggestions.map((r) => (
            <div key={r.id} className="relative flex flex-col">
              <RecipeCard recipe={r} onClick={() => setSelected(r)} />
              <button
                onClick={() => saved.has(r.id) ? undefined : setEditTarget(r)}
                disabled={saved.has(r.id)}
                className="absolute bottom-3 right-3 px-3 py-1 text-xs rounded-lg transition-colors disabled:opacity-50"
                style={{ background: saved.has(r.id) ? "#d8f3dc" : "#2d6a4f", color: saved.has(r.id) ? "#2d6a4f" : "white" }}
              >
                {saved.has(r.id) ? "Saved ✓" : "Save"}
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && <RecipeModal recipe={selected} onClose={() => setSelected(null)} />}
      {editTarget && (
        <EditBeforeSaveModal
          recipe={editTarget}
          onSave={handleSave}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
    </div>
  );
}
