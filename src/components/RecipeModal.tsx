"use client";

import { useEffect } from "react";
import { X, Clock, Users, Trash2, Lock, Unlock, CheckCircle2 } from "lucide-react";
import { useRecipeStore } from "@/lib/store";
import type { Recipe } from "@/lib/types";

export function RecipeModal({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  const deleteRecipe = useRecipeStore((s) => s.deleteRecipe);
  const updateRecipe = useRecipeStore((s) => s.updateRecipe);
  const logCook = useRecipeStore((s) => s.logCook);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const handleDelete = () => {
    if (confirm("Delete this recipe?")) {
      deleteRecipe(recipe.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }} />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-2xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl"
        style={{ background: "rgba(253, 248, 240, 0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.4)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — outside scroll container so nothing slides under it */}
        <div className="flex-shrink-0 flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[#e5e7eb]/50">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-[#0d0d0d] leading-snug">{recipe.title}</h1>
            <p className="text-[#6b7280] text-sm mt-1 leading-relaxed">{recipe.description}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => updateRecipe(recipe.id, { isPrivate: !recipe.isPrivate })}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${recipe.isPrivate ? "border-[#2d6a4f] text-[#2d6a4f] bg-[#d8f3dc]" : "border-[#6b7280] text-[#374151] hover:border-[#2d6a4f] hover:text-[#2d6a4f]"}`}
            >
              {recipe.isPrivate ? <Lock size={11} /> : <Unlock size={11} />}
              {recipe.isPrivate ? "Private" : "Public"}
            </button>
            <button onClick={handleDelete} className="p-2 text-[#6b7280] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={15} />
            </button>
            <button onClick={onClose} className="p-2 text-[#6b7280] hover:text-[#0d0d0d] hover:bg-black/10 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-6">
          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-[#6b7280] mb-6 pb-6 border-b border-[#e5e7eb]">
            <span className="flex items-center gap-1.5"><Clock size={13} />Prep {recipe.prepTime} min</span>
            <span className="flex items-center gap-1.5"><Clock size={13} />Cook {recipe.cookTime} min</span>
            <span className="flex items-center gap-1.5"><Users size={13} />{recipe.servings} servings</span>
            <span className="ml-auto text-xs bg-[#f3f4f6] px-2 py-0.5 rounded-full">{recipe.cuisine}</span>
          </div>

          {/* Macros */}
          {recipe.calories && (
            <div className="grid grid-cols-5 gap-2 mb-6 p-4 rounded-2xl bg-[#f0fdf4] border border-[#d1fae5]">
              {[
                { label: "Calories", value: recipe.calories, unit: "kcal" },
                { label: "Protein", value: recipe.proteinG, unit: "g" },
                { label: "Carbs", value: recipe.carbsG, unit: "g" },
                { label: "Fat", value: recipe.fatG, unit: "g" },
                { label: "Fiber", value: recipe.fiberG, unit: "g" },
              ].map(({ label, value, unit }) => (
                <div key={label} className="text-center">
                  <p className="text-sm font-semibold text-[#2d6a4f]">{value}{unit === "kcal" ? "" : unit}</p>
                  <p className="text-xs text-[#6b7280] mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {recipe.tags.map((tag) => (
                <span key={tag} className="text-xs text-[#40916c] bg-[#d8f3dc] px-2.5 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          )}

          {/* Ingredients */}
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-[#0d0d0d] uppercase tracking-wider mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-baseline gap-3 text-sm">
                  <span className="shrink-0 w-24 text-right text-[#6b7280]">{ing.amount} {ing.unit}</span>
                  <span className="w-px h-3 bg-[#e5e7eb] shrink-0" />
                  <span className="text-[#0d0d0d]">{ing.name}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Method */}
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-[#0d0d0d] uppercase tracking-wider mb-4">Method</h2>
            <ol className="space-y-4">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-4 text-sm">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[#2d6a4f] text-white text-xs flex items-center justify-center font-medium mt-0.5">{i + 1}</span>
                  <p className="text-[#374151] leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Footer */}
          <div className="border-t border-[#e5e7eb] pt-6 flex items-center justify-between">
            <span className="text-sm text-[#9ca3af]">
              {recipe.cooked > 0 ? `Cooked ${recipe.cooked} time${recipe.cooked > 1 ? "s" : ""}` : "Never cooked"}
            </span>
            <button
              onClick={() => logCook(recipe.id)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2d6a4f] text-white text-sm rounded-xl hover:bg-[#40916c] transition-colors"
            >
              <CheckCircle2 size={15} />
              Mark as cooked
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
