"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRecipeStore } from "@/lib/store";
import type { Recipe, Ingredient } from "@/lib/types";
import { Plus, Minus } from "lucide-react";

const emptyIngredient = (): Ingredient => ({ amount: "", unit: "", name: "" });

export default function AddRecipePage() {
  const router = useRouter();
  const addRecipe = useRecipeStore((s) => s.addRecipe);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [tags, setTags] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("4");
  const [ingredients, setIngredients] = useState<Ingredient[]>([emptyIngredient()]);
  const [steps, setSteps] = useState<string[]>([""]);

  const setIngredient = (i: number, field: keyof Ingredient, value: string) => {
    setIngredients((prev) => prev.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing));
  };

  const setStep = (i: number, value: string) => {
    setSteps((prev) => prev.map((s, idx) => idx === i ? value : s));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recipe: Recipe = {
      id: Date.now().toString(),
      title,
      description,
      cuisine,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      ingredients: ingredients.filter((i) => i.name),
      steps: steps.filter((s) => s.trim()),
      prepTime: parseInt(prepTime) || 0,
      cookTime: parseInt(cookTime) || 0,
      servings: parseInt(servings) || 4,
      createdAt: new Date().toISOString(),
      cooked: 0,
    };
    addRecipe(recipe);
    router.push("/");
  };

  const inputClass =
    "w-full px-3.5 py-2.5 text-sm border border-[#e5e7eb] rounded-xl bg-white focus:outline-none focus:border-[#2d6a4f] transition-colors";
  const labelClass = "block text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-[#0d0d0d] mb-1">Add recipe</h1>
        <p className="text-sm text-[#6b7280]">Save a new recipe to your collection.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={labelClass}>Title *</label>
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Mushroom Risotto" />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea className={inputClass} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short note about the dish…" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Cuisine</label>
            <input className={inputClass} value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="e.g. Italian" />
          </div>
          <div>
            <label className={labelClass}>Tags (comma separated)</label>
            <input className={inputClass} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="quick, vegetarian…" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Prep (min)</label>
            <input className={inputClass} type="number" min="0" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} placeholder="10" />
          </div>
          <div>
            <label className={labelClass}>Cook (min)</label>
            <input className={inputClass} type="number" min="0" value={cookTime} onChange={(e) => setCookTime(e.target.value)} placeholder="30" />
          </div>
          <div>
            <label className={labelClass}>Servings</label>
            <input className={inputClass} type="number" min="1" value={servings} onChange={(e) => setServings(e.target.value)} />
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <label className={labelClass}>Ingredients</label>
          <div className="space-y-2">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={`${inputClass} w-20`}
                  value={ing.amount}
                  onChange={(e) => setIngredient(i, "amount", e.target.value)}
                  placeholder="qty"
                />
                <input
                  className={`${inputClass} w-20`}
                  value={ing.unit}
                  onChange={(e) => setIngredient(i, "unit", e.target.value)}
                  placeholder="unit"
                />
                <input
                  className={`${inputClass} flex-1`}
                  value={ing.name}
                  onChange={(e) => setIngredient(i, "name", e.target.value)}
                  placeholder="ingredient name"
                />
                <button
                  type="button"
                  onClick={() => setIngredients((prev) => prev.filter((_, idx) => idx !== i))}
                  className="p-2.5 text-[#9ca3af] hover:text-red-500 transition-colors"
                >
                  <Minus size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIngredients((prev) => [...prev, emptyIngredient()])}
            className="mt-2 flex items-center gap-1.5 text-sm text-[#2d6a4f] hover:text-[#40916c] transition-colors"
          >
            <Plus size={14} />
            Add ingredient
          </button>
        </div>

        {/* Steps */}
        <div>
          <label className={labelClass}>Method</label>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-2">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[#2d6a4f] text-white text-xs flex items-center justify-center mt-2.5 font-medium">
                  {i + 1}
                </span>
                <textarea
                  className={`${inputClass} flex-1`}
                  rows={2}
                  value={step}
                  onChange={(e) => setStep(i, e.target.value)}
                  placeholder={`Step ${i + 1}…`}
                />
                <button
                  type="button"
                  onClick={() => setSteps((prev) => prev.filter((_, idx) => idx !== i))}
                  className="p-2.5 text-[#9ca3af] hover:text-red-500 transition-colors self-start mt-1"
                >
                  <Minus size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSteps((prev) => [...prev, ""])}
            className="mt-2 flex items-center gap-1.5 text-sm text-[#2d6a4f] hover:text-[#40916c] transition-colors"
          >
            <Plus size={14} />
            Add step
          </button>
        </div>

        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-2.5 text-sm border border-[#e5e7eb] rounded-xl text-[#6b7280] hover:border-[#2d6a4f] hover:text-[#2d6a4f] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 text-sm bg-[#2d6a4f] text-white rounded-xl hover:bg-[#40916c] transition-colors font-medium"
          >
            Save recipe
          </button>
        </div>
      </form>
    </div>
  );
}
