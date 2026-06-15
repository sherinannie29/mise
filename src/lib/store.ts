import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Recipe, CookLog } from "./types";
interface RecipeStore {
  recipes: Recipe[];
  cookLogs: CookLog[];
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  logCook: (recipeId: string, notes?: string) => void;
  getRecommendations: () => Recipe[];
}

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set, get) => ({
      recipes: [],
      cookLogs: [],

      addRecipe: (recipe) =>
        set((s) => ({ recipes: [...s.recipes, recipe] })),

      updateRecipe: (id, updates) =>
        set((s) => ({
          recipes: s.recipes.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

      deleteRecipe: (id) =>
        set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) })),

      logCook: (recipeId, notes) => {
        const log: CookLog = { recipeId, cookedAt: new Date().toISOString(), notes };
        set((s) => ({
          cookLogs: [...s.cookLogs, log],
          recipes: s.recipes.map((r) =>
            r.id === recipeId ? { ...r, cooked: r.cooked + 1 } : r
          ),
        }));
      },

      getRecommendations: () => {
        const { recipes, cookLogs } = get();
        if (cookLogs.length === 0) return recipes.slice(0, 3);

        // Tally tag frequencies from cook history
        const tagCount: Record<string, number> = {};
        const cuisineCount: Record<string, number> = {};
        for (const log of cookLogs) {
          const recipe = recipes.find((r) => r.id === log.recipeId);
          if (!recipe) continue;
          for (const tag of recipe.tags) tagCount[tag] = (tagCount[tag] ?? 0) + 1;
          cuisineCount[recipe.cuisine] = (cuisineCount[recipe.cuisine] ?? 0) + 1;
        }

        // Score each recipe
        const recentIds = cookLogs.slice(-5).map((l) => l.recipeId);
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
    }),
    { name: "mise-recipes-v2" }
  )
);
