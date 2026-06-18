import { create } from "zustand";
import { supabase } from "./supabase";
import type { Recipe, CookLog } from "./types";
import { refreshRecommendations } from "./recommendations";

interface RecipeStore {
  recipes: Recipe[];
  cookLogs: CookLog[];
  loading: boolean;
  fetchRecipes: () => Promise<void>;
  addRecipe: (recipe: Recipe) => Promise<void>;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  logCook: (recipeId: string, notes?: string) => Promise<void>;
  getRecommendations: () => Recipe[];
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  cookLogs: [],
  loading: false,

  fetchRecipes: async () => {
    set({ loading: true });
    const { data: { user } } = await supabase.auth.getUser();
    const { data: recipes } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    const { data: cookLogs } = await supabase
      .from("cook_logs")
      .select("*")
      .order("cooked_at", { ascending: false });

    set({
      recipes: (recipes ?? []).map(dbToRecipe),
      cookLogs: (cookLogs ?? []).map((l: DbCookLog) => ({
        recipeId: l.recipe_id,
        cookedAt: l.cooked_at,
        notes: l.notes,
      })),
      loading: false,
    });
  },

  addRecipe: async (recipe) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("recipes")
      .insert({ ...recipeToDb(recipe), user_id: user?.id })
      .select()
      .single();
    if (!error && data) {
      const newRecipe = dbToRecipe(data);
      const updatedRecipes = [newRecipe, ...get().recipes];
      set({ recipes: updatedRecipes });
      // Fire and forget — both run in background
      refreshRecommendations(updatedRecipes, newRecipe);
      (async () => {
        try {
          const res = await fetch("/api/macros", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newRecipe.title, ingredients: newRecipe.ingredients, servings: newRecipe.servings }),
          });
          const macros = await res.json();
          if (macros.calories) {
            await supabase.from("recipes").update({
              calories: macros.calories,
              protein_g: macros.protein_g,
              carbs_g: macros.carbs_g,
              fat_g: macros.fat_g,
              fiber_g: macros.fiber_g,
            }).eq("id", newRecipe.id);
            set((s) => ({
              recipes: s.recipes.map((r) => r.id === newRecipe.id ? {
                ...r,
                calories: macros.calories,
                proteinG: macros.protein_g,
                carbsG: macros.carbs_g,
                fatG: macros.fat_g,
                fiberG: macros.fiber_g,
              } : r),
            }));
          }
        } catch (e) {
          console.error("Macro calculation failed:", e);
        }
      })();
    }
  },

  updateRecipe: async (id, updates) => {
    const current = get().recipes.find((r) => r.id === id);
    if (!current) return;
    const merged = { ...current, ...updates };
    const { error } = await supabase
      .from("recipes")
      .update(recipeToDb(merged))
      .eq("id", id);
    if (!error) {
      set((s) => ({
        recipes: s.recipes.map((r) => (r.id === id ? merged : r)),
      }));
    }
  },

  deleteRecipe: async (id) => {
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (!error) {
      set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) }));
    }
  },

  logCook: async (recipeId, notes) => {
    const { error } = await supabase
      .from("cook_logs")
      .insert({ recipe_id: recipeId, notes });

    if (!error) {
      const newCooked = (get().recipes.find((r) => r.id === recipeId)?.cooked ?? 0) + 1;
      await supabase.from("recipes").update({ cooked: newCooked }).eq("id", recipeId);

      const log: CookLog = { recipeId, cookedAt: new Date().toISOString(), notes };
      set((s) => ({
        cookLogs: [log, ...s.cookLogs],
        recipes: s.recipes.map((r) =>
          r.id === recipeId ? { ...r, cooked: r.cooked + 1 } : r
        ),
      }));
    }
  },

  getRecommendations: () => {
    const { recipes, cookLogs } = get();
    if (cookLogs.length === 0) return recipes.slice(0, 3);

    const tagCount: Record<string, number> = {};
    const cuisineCount: Record<string, number> = {};
    for (const log of cookLogs) {
      const recipe = recipes.find((r) => r.id === log.recipeId);
      if (!recipe) continue;
      for (const tag of recipe.tags) tagCount[tag] = (tagCount[tag] ?? 0) + 1;
      cuisineCount[recipe.cuisine] = (cuisineCount[recipe.cuisine] ?? 0) + 1;
    }

    const recentIds = cookLogs.slice(0, 5).map((l) => l.recipeId);
    return recipes
      .filter((r) => !recentIds.includes(r.id))
      .map((r) => {
        let score = 0;
        for (const tag of r.tags) score += tagCount[tag] ?? 0;
        score += (cuisineCount[r.cuisine] ?? 0) * 2;
        return { recipe: r, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((x) => x.recipe);
  },
}));

// DB row types
interface DbRecipe {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  tags: string[];
  ingredients: { amount: string; unit: string; name: string }[];
  steps: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  created_at: string;
  cooked: number;
  is_private: boolean;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
}

interface DbCookLog {
  recipe_id: string;
  cooked_at: string;
  notes?: string;
}

function dbToRecipe(row: DbRecipe): Recipe {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    cuisine: row.cuisine,
    tags: row.tags ?? [],
    ingredients: row.ingredients ?? [],
    steps: row.steps ?? [],
    prepTime: row.prep_time,
    cookTime: row.cook_time,
    servings: row.servings,
    createdAt: row.created_at,
    cooked: row.cooked ?? 0,
    isPrivate: row.is_private ?? false,
    calories: row.calories,
    proteinG: row.protein_g,
    carbsG: row.carbs_g,
    fatG: row.fat_g,
    fiberG: row.fiber_g,
  };
}

function recipeToDb(r: Recipe) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    cuisine: r.cuisine,
    tags: r.tags,
    ingredients: r.ingredients,
    steps: r.steps,
    prep_time: r.prepTime,
    cook_time: r.cookTime,
    servings: r.servings,
    created_at: r.createdAt,
    cooked: r.cooked,
    is_private: r.isPrivate ?? false,
    calories: r.calories,
    protein_g: r.proteinG,
    carbs_g: r.carbsG,
    fat_g: r.fatG,
    fiber_g: r.fiberG,
  };
}
