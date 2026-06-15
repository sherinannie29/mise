"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRecipeStore } from "@/lib/store";
import { Clock, Users, ChevronLeft, Trash2, CheckCircle2 } from "lucide-react";

export default function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const recipe = useRecipeStore((s) => s.recipes.find((r) => r.id === id));
  const deleteRecipe = useRecipeStore((s) => s.deleteRecipe);
  const logCook = useRecipeStore((s) => s.logCook);
  const fetchRecipes = useRecipeStore((s) => s.fetchRecipes);

  useEffect(() => { if (!recipe) fetchRecipes(); }, []);

  if (!recipe) return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center text-[#9ca3af]">
      Recipe not found.
    </div>
  );

  const handleDelete = () => {
    if (confirm("Delete this recipe?")) {
      deleteRecipe(id);
      router.push("/");
    }
  };

  const handleLogCook = () => {
    logCook(id);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#0d0d0d] mb-8 transition-colors"
      >
        <ChevronLeft size={16} />
        Back
      </button>

      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-3xl font-semibold tracking-tight text-[#0d0d0d]">
            {recipe.title}
          </h1>
          <button
            onClick={handleDelete}
            className="shrink-0 p-2 text-[#9ca3af] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <p className="text-[#6b7280] text-sm leading-relaxed">{recipe.description}</p>
      </div>

      <div className="flex items-center gap-4 text-sm text-[#6b7280] mb-6 pb-6 border-b border-[#e5e7eb]">
        <span className="flex items-center gap-1.5">
          <Clock size={14} />
          Prep {recipe.prepTime} min
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={14} />
          Cook {recipe.cookTime} min
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={14} />
          {recipe.servings} servings
        </span>
        <span className="ml-auto text-xs bg-[#f3f4f6] text-[#6b7280] px-2 py-0.5 rounded-full">
          {recipe.cuisine}
        </span>
      </div>

      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-8">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-[#40916c] bg-[#d8f3dc] px-2.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-[#0d0d0d] uppercase tracking-wider mb-4">
          Ingredients
        </h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-baseline gap-3 text-sm">
              <span className="shrink-0 w-24 text-right text-[#6b7280]">
                {ing.amount} {ing.unit}
              </span>
              <span className="w-px h-3 bg-[#e5e7eb] shrink-0" />
              <span className="text-[#0d0d0d]">{ing.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-[#0d0d0d] uppercase tracking-wider mb-4">
          Method
        </h2>
        <ol className="space-y-4">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-4 text-sm">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[#2d6a4f] text-white text-xs flex items-center justify-center font-medium mt-0.5">
                {i + 1}
              </span>
              <p className="text-[#374151] leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="border-t border-[#e5e7eb] pt-6 flex items-center justify-between">
        <span className="text-sm text-[#9ca3af]">
          {recipe.cooked > 0 ? `Cooked ${recipe.cooked} time${recipe.cooked > 1 ? "s" : ""}` : "Never cooked"}
        </span>
        <button
          onClick={handleLogCook}
          className="flex items-center gap-2 px-4 py-2 bg-[#2d6a4f] text-white text-sm rounded-xl hover:bg-[#40916c] transition-colors"
        >
          <CheckCircle2 size={15} />
          Mark as cooked
        </button>
      </div>
    </div>
  );
}
