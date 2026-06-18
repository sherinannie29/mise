import { supabase } from "./supabase";
import type { Recipe } from "./types";

export async function refreshRecommendations(recipes: Recipe[], newRecipe: Recipe | null) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("recommendations")
    .select("suggestions")
    .eq("user_id", user.id)
    .single();

  const currentSuggestions: Recipe[] = existing?.suggestions ?? [];

  try {
    const res = await fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newRecipe,
        savedRecipes: recipes,
        existing: currentSuggestions,
      }),
    });

    const data = await res.json();
    if (!data.recipes) return;

    const mapped: Recipe[] = data.recipes.map((r: any, i: number) => ({
      ...r,
      id: `suggestion-${Date.now()}-${i}`,
      cooked: 0,
      createdAt: new Date().toISOString(),
    }));

    const existingTitles = new Set(currentSuggestions.map((r) => r.title.toLowerCase()));
    const fresh = mapped.filter((r) => !existingTitles.has(r.title.toLowerCase()));
    const updated = [...currentSuggestions, ...fresh];

    await supabase.from("recommendations").upsert({
      user_id: user.id,
      suggestions: updated,
      recipe_count: recipes.length,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
  } catch (e) {
    console.error("Failed to refresh recommendations:", e);
  }
}
