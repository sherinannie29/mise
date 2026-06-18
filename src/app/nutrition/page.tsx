"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRecipeStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Flame, Pencil, Plus, Trash2, Search, ChefHat, History, X } from "lucide-react";
import type { Recipe } from "@/lib/types";

interface MealLog {
  id: string;
  recipe_id?: string | null;
  servings?: number;
  logged_at: string;
  food_data?: {
    name: string;
    calories_per_100g: number;
    protein_per_100g: number;
    carbs_per_100g: number;
    fat_per_100g: number;
    fiber_per_100g: number;
    amount_g: number;
  } | null;
}

interface FoodResult {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number;
}

interface DayData {
  date: string;
  label: string;
  calories: number;
  meals: MealLog[];
}

const GOAL_KEY = "mise-calorie-goal";
const MACRO_GOAL_KEY = "mise-macro-goals";

function getMealCalories(meal: MealLog, recipes: Recipe[]): number {
  if (meal.food_data) {
    return Math.round((meal.food_data.calories_per_100g * meal.food_data.amount_g) / 100);
  }
  const r = recipes.find((x) => x.id === meal.recipe_id);
  return r?.calories ? Math.round(r.calories * (meal.servings ?? 1)) : 0;
}

function getMealMacros(meal: MealLog, recipes: Recipe[]) {
  if (meal.food_data) {
    const f = meal.food_data;
    const scale = f.amount_g / 100;
    return {
      protein: f.protein_per_100g * scale,
      carbs: f.carbs_per_100g * scale,
      fat: f.fat_per_100g * scale,
      fiber: f.fiber_per_100g * scale,
    };
  }
  const r = recipes.find((x) => x.id === meal.recipe_id);
  const mult = meal.servings ?? 1;
  return {
    protein: (r?.proteinG ?? 0) * mult,
    carbs: (r?.carbsG ?? 0) * mult,
    fat: (r?.fatG ?? 0) * mult,
    fiber: (r?.fiberG ?? 0) * mult,
  };
}

function getMealName(meal: MealLog, recipes: Recipe[]): string {
  if (meal.food_data) return meal.food_data.name;
  return recipes.find((x) => x.id === meal.recipe_id)?.title ?? "Unknown";
}

export default function NutritionPage() {
  const recipes = useRecipeStore((s) => s.recipes);
  const fetchRecipes = useRecipeStore((s) => s.fetchRecipes);

  const [meals, setMeals] = useState<MealLog[]>([]);
  const [goal, setGoal] = useState(2000);
  const [macroGoals, setMacroGoals] = useState({ protein: 150, carbs: 200, fat: 65, fiber: 30 });
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("2000");
  const [macroInput, setMacroInput] = useState({ protein: "150", carbs: "200", fat: "65", fiber: "30" });

  // Log meal modal
  const [showAdd, setShowAdd] = useState(false);
  const [logTab, setLogTab] = useState<"recipe" | "food">("recipe");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snacks">("breakfast");
  const [selectedRecipe, setSelectedRecipe] = useState<string>("");
  const [servings, setServings] = useState(1);
  // Food search
  const [foodQuery, setFoodQuery] = useState("");
  const [foodResults, setFoodResults] = useState<FoodResult[]>([]);
  const [foodSearching, setFoodSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodResult | null>(null);
  const [amountG, setAmountG] = useState(100);

  // History
  const [view, setView] = useState<"today" | "history">("today");
  const [historyData, setHistoryData] = useState<DayData[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (recipes.length === 0) fetchRecipes();
    const saved = localStorage.getItem(GOAL_KEY);
    if (saved) { setGoal(Number(saved)); setGoalInput(saved); }
    const savedMacros = localStorage.getItem(MACRO_GOAL_KEY);
    if (savedMacros) {
      const m = JSON.parse(savedMacros);
      setMacroGoals(m);
      setMacroInput({ protein: String(m.protein), carbs: String(m.carbs), fat: String(m.fat), fiber: String(m.fiber) });
    }
    loadMeals();
    if (searchParams.get("add") === "1") setShowAdd(true);
  }, []);

  useEffect(() => {
    if (recipes.length > 0) loadHistory();
  }, [recipes.length]);

  const today = new Date().toISOString().split("T")[0];

  const loadMeals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("meal_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_at", `${today}T00:00:00`)
      .lte("logged_at", `${today}T23:59:59`)
      .order("logged_at", { ascending: true });
    setMeals(data ?? []);
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setHistoryLoading(false); return; }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const from = sevenDaysAgo.toISOString().split("T")[0];

    const { data } = await supabase
      .from("meal_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_at", `${from}T00:00:00`)
      .order("logged_at", { ascending: true });

    const logs = data ?? [];
    const days: DayData[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayMeals = logs.filter((m) => m.logged_at?.startsWith(dateStr));
      const calories = dayMeals.reduce((sum: number, m: MealLog) => sum + getMealCalories(m, recipes), 0);
      const label = i === 0 ? "Today" : i === 1 ? "Yesterday" : d.toLocaleDateString("en-GB", { weekday: "short" });
      days.push({ date: dateStr, label, calories, meals: dayMeals });
    }
    setHistoryData(days);
    setHistoryLoading(false);
  };

  const getMealTypeTime = () => {
    const d = new Date();
    const hours: Record<string, number> = { breakfast: 8, lunch: 12, dinner: 19, snacks: 21 };
    d.setHours(hours[mealType], 0, 0, 0);
    return d.toISOString();
  };

  const handleAddMeal = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const loggedAt = getMealTypeTime();

    if (logTab === "recipe") {
      if (!selectedRecipe) return;
      const { data } = await supabase.from("meal_logs").insert({
        user_id: user.id,
        recipe_id: selectedRecipe,
        servings,
        logged_at: loggedAt,
      }).select().single();
      if (data) setMeals((prev) => [...prev, data]);
    } else {
      if (!selectedFood) return;
      const { data } = await supabase.from("meal_logs").insert({
        user_id: user.id,
        recipe_id: null,
        servings: 1,
        logged_at: loggedAt,
        food_data: { ...selectedFood, amount_g: amountG },
      }).select().single();
      if (data) setMeals((prev) => [...prev, data]);
    }

    setShowAdd(false);
    setSelectedRecipe("");
    setServings(1);
    setSelectedFood(null);
    setFoodQuery("");
    setFoodResults([]);
    setAmountG(100);
    setMealType("breakfast");
  };

  const handleDelete = async (id: string) => {
    await supabase.from("meal_logs").delete().eq("id", id);
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveGoal = () => {
    const val = Number(goalInput);
    if (val > 0) { setGoal(val); localStorage.setItem(GOAL_KEY, String(val)); }
    const m = {
      protein: Number(macroInput.protein),
      carbs: Number(macroInput.carbs),
      fat: Number(macroInput.fat),
      fiber: Number(macroInput.fiber),
    };
    setMacroGoals(m);
    localStorage.setItem(MACRO_GOAL_KEY, JSON.stringify(m));
    setEditingGoal(false);
  };

  const searchFood = async () => {
    if (!foodQuery.trim()) return;
    setFoodSearching(true);
    setFoodResults([]);
    setSelectedFood(null);
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(foodQuery)}&json=1&page_size=10&fields=id,product_name,nutriments`
      );
      const json = await res.json();
      const results: FoodResult[] = (json.products ?? [])
        .filter((p: any) => p.product_name && p.nutriments?.["energy-kcal_100g"])
        .slice(0, 8)
        .map((p: any) => ({
          id: p.id ?? p.product_name,
          name: p.product_name,
          calories_per_100g: Math.round(p.nutriments["energy-kcal_100g"] ?? 0),
          protein_per_100g: Math.round((p.nutriments["proteins_100g"] ?? 0) * 10) / 10,
          carbs_per_100g: Math.round((p.nutriments["carbohydrates_100g"] ?? 0) * 10) / 10,
          fat_per_100g: Math.round((p.nutriments["fat_100g"] ?? 0) * 10) / 10,
          fiber_per_100g: Math.round((p.nutriments["fiber_100g"] ?? 0) * 10) / 10,
        }));
      setFoodResults(results);
    } catch {
      setFoodResults([]);
    }
    setFoodSearching(false);
  };

  const totals = meals.reduce((acc, meal) => {
    const cal = getMealCalories(meal, recipes);
    const macro = getMealMacros(meal, recipes);
    return {
      calories: acc.calories + cal,
      protein: acc.protein + macro.protein,
      carbs: acc.carbs + macro.carbs,
      fat: acc.fat + macro.fat,
      fiber: acc.fiber + macro.fiber,
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  const progress = Math.min((totals.calories / goal) * 100, 100);
  const recipesWithMacros = recipes.filter((r) => r.calories);
  const maxHistoryCal = Math.max(...historyData.map((d) => d.calories), goal, 1);

  const weeklyAverages = (() => {
    const daysWithMeals = historyData.filter((d) => d.meals.length > 0);
    const n = Math.max(daysWithMeals.length, 1);
    const allMeals = daysWithMeals.flatMap((d) => d.meals);
    const totalCal = allMeals.reduce((s, m) => s + getMealCalories(m, recipes), 0);
    const macroTotals = allMeals.reduce(
      (acc, m) => {
        const mac = getMealMacros(m, recipes);
        return { protein: acc.protein + mac.protein, carbs: acc.carbs + mac.carbs, fat: acc.fat + mac.fat, fiber: acc.fiber + mac.fiber };
      },
      { protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
    return {
      calories: Math.round(totalCal / n),
      protein: Math.round(macroTotals.protein / n),
      carbs: Math.round(macroTotals.carbs / n),
      fat: Math.round(macroTotals.fat / n),
      fiber: Math.round(macroTotals.fiber / n),
      days: n,
    };
  })();

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <img
        src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=80"
        alt=""
        className="fixed inset-0 w-full h-full object-cover -z-10"
        style={{ filter: "blur(18px) brightness(0.7) saturate(0.8)", transform: "scale(1.15)" }}
      />
      <div className="fixed inset-0 -z-10" style={{ background: "rgba(5, 20, 10, 0.45)" }} />

    <div className="max-w-3xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl tracking-tight text-white" style={{ fontFamily: "Georgia, serif", fontWeight: 700 }}>Nutrition</h1>
          <p className="text-white/70 text-sm mt-1">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#2d6a4f] text-white text-sm rounded-xl hover:bg-[#1b4332] transition-colors"
        >
          <Plus size={15} />
          Log meal
        </button>
      </div>

      {/* Calorie goal card */}
      <div className="rounded-2xl p-8 mb-6" style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.75)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-[#2d6a4f]" />
            <span className="font-medium text-[#0d0d0d]">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6b7280]">Goal: {goal} kcal</span>
            <button onClick={() => setEditingGoal(true)} className="p-1.5 text-[#9ca3af] hover:text-[#2d6a4f] transition-colors">
              <Pencil size={13} />
            </button>
          </div>
        </div>

        {editingGoal && (
          <div className="mb-4 p-4 bg-[#f9f6f0] rounded-xl border border-[#e5e7eb]">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-[#6b7280] mb-1 block">Calories (kcal)</label>
                <input autoFocus type="number" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-xl focus:outline-none focus:border-[#2d6a4f] bg-white" />
              </div>
              <div>
                <label className="text-xs text-[#6b7280] mb-1 block">Protein (g)</label>
                <input type="number" value={macroInput.protein} onChange={(e) => setMacroInput((p) => ({ ...p, protein: e.target.value }))} className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-xl focus:outline-none focus:border-[#2d6a4f] bg-white" />
              </div>
              <div>
                <label className="text-xs text-[#6b7280] mb-1 block">Carbs (g)</label>
                <input type="number" value={macroInput.carbs} onChange={(e) => setMacroInput((p) => ({ ...p, carbs: e.target.value }))} className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-xl focus:outline-none focus:border-[#2d6a4f] bg-white" />
              </div>
              <div>
                <label className="text-xs text-[#6b7280] mb-1 block">Fat (g)</label>
                <input type="number" value={macroInput.fat} onChange={(e) => setMacroInput((p) => ({ ...p, fat: e.target.value }))} className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-xl focus:outline-none focus:border-[#2d6a4f] bg-white" />
              </div>
              <div>
                <label className="text-xs text-[#6b7280] mb-1 block">Fiber (g)</label>
                <input type="number" value={macroInput.fiber} onChange={(e) => setMacroInput((p) => ({ ...p, fiber: e.target.value }))} className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-xl focus:outline-none focus:border-[#2d6a4f] bg-white" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveGoal} className="flex-1 py-2 bg-[#2d6a4f] text-white text-sm rounded-xl">Save</button>
              <button onClick={() => setEditingGoal(false)} className="px-4 py-2 border border-[#e5e7eb] text-[#6b7280] text-sm rounded-xl">Cancel</button>
            </div>
          </div>
        )}

        <div className="w-full bg-[#f3f4f6] rounded-full h-3 mb-2">
          <div
            className="h-3 rounded-full transition-all"
            style={{ width: `${progress}%`, background: progress >= 100 ? "#ef4444" : "#2d6a4f" }}
          />
        </div>
        <div className="flex justify-between text-xs text-[#6b7280]">
          <span>{Math.round(totals.calories)} kcal eaten</span>
          <span>{Math.max(0, goal - Math.round(totals.calories))} kcal remaining</span>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#e5e7eb]">
          {[
            { label: "Protein", value: totals.protein, goalVal: macroGoals.protein },
            { label: "Carbs", value: totals.carbs, goalVal: macroGoals.carbs },
            { label: "Fat", value: totals.fat, goalVal: macroGoals.fat },
            { label: "Fiber", value: totals.fiber, goalVal: macroGoals.fiber },
          ].map(({ label, value, goalVal }) => (
            <div key={label} className="text-center">
              <p className="text-sm font-semibold text-[#111827]">{Math.round(value)}g</p>
              <p className="text-xs font-medium text-[#374151]">{label}</p>
              <div className="w-full bg-[#e5e7eb] rounded-full h-1 mt-1">
                <div className="h-1 rounded-full bg-[#2d6a4f] transition-all" style={{ width: `${Math.min((value / goalVal) * 100, 100)}%` }} />
              </div>
              <p className="text-xs text-[#6b7280] mt-0.5">/{goalVal}g</p>
            </div>
          ))}
        </div>
      </div>

      {/* View tabs */}
      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setView("today")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-colors ${view === "today" ? "bg-[#2d6a4f] text-white" : "text-white/70 hover:bg-white/20"}`}
        >
          <Flame size={13} /> Today
        </button>
        <button
          onClick={() => { setView("history"); if (historyData.length === 0) loadHistory(); }}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-colors ${view === "history" ? "bg-[#2d6a4f] text-white" : "text-white/70 hover:bg-white/20"}`}
        >
          <History size={13} /> History
        </button>
      </div>

      {view === "today" && (
        <div className="flex flex-col gap-6">
          {meals.length === 0 && (
            <p className="text-sm text-white/60 text-center py-8">No meals logged yet — tap Log meal above.</p>
          )}
          {[
            { label: "Breakfast", hours: [8] },
            { label: "Lunch", hours: [12] },
            { label: "Dinner", hours: [19] },
            { label: "Evening snacks", hours: [21] },
          ].map(({ label, hours }) => {
            const group = meals.filter((m) => hours.includes(new Date(m.logged_at).getHours()));
            if (group.length === 0) return null;
            const groupCal = group.reduce((s, m) => s + getMealCalories(m, recipes), 0);
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">{label}</h2>
                  <span className="text-xs text-[#9ca3af]">{Math.round(groupCal)} kcal</span>
                </div>
                <div className="flex flex-col gap-2">
                  {group.map((meal) => (
                    <div key={meal.id} className="group flex items-center gap-4 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.75)" }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0d0d0d] truncate">{getMealName(meal, recipes)}</p>
                        <p className="text-xs text-[#9ca3af]">
                          {meal.food_data
                            ? `${meal.food_data.amount_g}g · ${getMealCalories(meal, recipes)} kcal`
                            : `${meal.servings} serving${meal.servings !== 1 ? "s" : ""} · ${getMealCalories(meal, recipes)} kcal`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(meal.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-[#9ca3af] hover:text-red-500 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "history" && (
        <div>
          {historyLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-[#f3f4f6] rounded-xl animate-pulse" />)}
            </div>
          ) : selectedDay ? (
            <div>
              <button
                onClick={() => setSelectedDay(null)}
                className="flex items-center gap-1.5 text-sm text-white/70 mb-4 hover:text-white transition-colors"
              >
                ← Back to week
              </button>
              <h2 className="text-xs font-medium text-white/70 uppercase tracking-wider mb-3">{selectedDay.label} · {Math.round(selectedDay.calories)} kcal</h2>
              {selectedDay.meals.length === 0 ? (
                <p className="text-sm text-white/60 text-center py-8">Nothing logged this day.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {selectedDay.meals.map((meal) => (
                    <div key={meal.id} className="flex items-center gap-4 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.75)" }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0d0d0d] truncate">{getMealName(meal, recipes)}</p>
                        <p className="text-xs text-[#9ca3af]">
                          {meal.food_data
                            ? `${meal.food_data.amount_g}g · ${getMealCalories(meal, recipes)} kcal`
                            : `${meal.servings} serving${meal.servings !== 1 ? "s" : ""} · ${getMealCalories(meal, recipes)} kcal`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-xs font-medium text-white/70 uppercase tracking-wider mb-4">Past 7 days</h2>
              <div className="rounded-2xl p-7" style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.75)" }}>
                <div className="flex items-end gap-2 h-32">
                  {historyData.map((day) => {
                    const heightPct = Math.max((day.calories / maxHistoryCal) * 100, day.calories > 0 ? 4 : 0);
                    const isToday = day.date === today;
                    const overGoal = day.calories > goal;
                    return (
                      <button
                        key={day.date}
                        onClick={() => setSelectedDay(day)}
                        className="flex-1 flex flex-col items-end gap-1 group h-full justify-end"
                        title={`${day.label}: ${Math.round(day.calories)} kcal`}
                      >
                        <div className="w-full rounded-t-lg transition-all group-hover:opacity-80" style={{
                          height: `${heightPct}%`,
                          minHeight: day.calories > 0 ? "4px" : "0",
                          background: isToday ? "#2d6a4f" : overGoal ? "#ef4444" : "#d8f3dc",
                        }} />
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-2">
                  {historyData.map((day) => (
                    <div key={day.date} className="flex-1 text-center">
                      <span className={`text-xs ${day.date === today ? "text-[#2d6a4f] font-semibold" : "text-[#4b5563] font-medium"}`}>{day.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#f3f4f6] text-xs text-[#9ca3af]">
                  <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-[#2d6a4f]" /> Today</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-[#d8f3dc]" /> Under goal</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm bg-[#ef4444]" /> Over goal</span>
                </div>
              </div>
              <p className="text-xs text-white/60 text-center mt-2">Tap a bar to see that day's meals</p>

              {/* Weekly averages */}
              <div className="rounded-2xl p-7 mt-4" style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.75)" }}>
                <p className="text-xs font-medium text-[#374151] uppercase tracking-wider mb-4">
                  Weekly averages <span className="normal-case font-normal text-[#6b7280]">({weeklyAverages.days} day{weeklyAverages.days !== 1 ? "s" : ""} logged)</span>
                </p>
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-[#111827]">{weeklyAverages.calories} kcal / day</span>
                    <span className="text-[#6b7280]">goal {goal} kcal</span>
                  </div>
                  <div className="w-full bg-[#f3f4f6] rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min((weeklyAverages.calories / goal) * 100, 100)}%`,
                        background: weeklyAverages.calories > goal ? "#ef4444" : "#2d6a4f",
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 pt-4 border-t border-[#e5e7eb]">
                  {[
                    { label: "Protein", value: weeklyAverages.protein, goalVal: macroGoals.protein },
                    { label: "Carbs", value: weeklyAverages.carbs, goalVal: macroGoals.carbs },
                    { label: "Fat", value: weeklyAverages.fat, goalVal: macroGoals.fat },
                    { label: "Fiber", value: weeklyAverages.fiber, goalVal: macroGoals.fiber },
                  ].map(({ label, value, goalVal }) => (
                    <div key={label} className="text-center">
                      <p className="text-sm font-semibold text-[#111827]">{value}g</p>
                      <p className="text-xs font-medium text-[#374151]">{label}</p>
                      <div className="w-full bg-[#e5e7eb] rounded-full h-1 mt-1">
                        <div
                          className="h-1 rounded-full transition-all"
                          style={{
                            width: `${Math.min((value / goalVal) * 100, 100)}%`,
                            background: value > goalVal ? "#ef4444" : "#2d6a4f",
                          }}
                        />
                      </div>
                      <p className="text-xs text-[#6b7280] mt-0.5">/{goalVal}g</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Log meal modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="absolute inset-0 bg-black/30" style={{ backdropFilter: "blur(4px)" }} />
          <div
            className="relative w-full sm:max-w-md bg-[#fdf8f0] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/50 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[#fdf8f0] px-6 pt-6 pb-4 border-b border-[#e5e7eb]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#0d0d0d]">Log a meal</h2>
                <button onClick={() => setShowAdd(false)} className="p-1.5 text-[#9ca3af] hover:text-[#0d0d0d]">
                  <X size={18} />
                </button>
              </div>
              <div className="flex gap-1 bg-[#f3f4f6] rounded-xl p-1">
                <button
                  onClick={() => setLogTab("recipe")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm transition-colors ${logTab === "recipe" ? "bg-white shadow-sm text-[#0d0d0d] font-medium" : "text-[#6b7280]"}`}
                >
                  <ChefHat size={13} /> My Recipes
                </button>
                <button
                  onClick={() => setLogTab("food")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm transition-colors ${logTab === "food" ? "bg-white shadow-sm text-[#0d0d0d] font-medium" : "text-[#6b7280]"}`}
                >
                  <Search size={13} /> Food Search
                </button>
              </div>
            </div>

            <div className="px-6 pt-4 pb-6">
              {/* Meal type */}
              <div className="mb-4">
                <label className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-2 block">Meal type</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {([
                    { value: "breakfast", label: "Breakfast" },
                    { value: "lunch", label: "Lunch" },
                    { value: "dinner", label: "Dinner" },
                    { value: "snacks", label: "Snacks" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setMealType(opt.value)}
                      className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${mealType === opt.value ? "bg-[#2d6a4f] text-white" : "bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {logTab === "recipe" ? (
                <>
                  <div className="mb-4">
                    <label className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-1.5 block">Recipe</label>
                    <select
                      value={selectedRecipe}
                      onChange={(e) => setSelectedRecipe(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[#e5e7eb] rounded-xl bg-white focus:outline-none focus:border-[#2d6a4f]"
                    >
                      <option value="">Select a recipe…</option>
                      {recipesWithMacros.map((r) => (
                        <option key={r.id} value={r.id}>{r.title} ({r.calories} kcal/serving)</option>
                      ))}
                    </select>
                    {recipesWithMacros.length === 0 && (
                      <p className="text-xs text-[#9ca3af] mt-1">Add recipes first — macros are calculated automatically.</p>
                    )}
                  </div>
                  <div className="mb-6">
                    <label className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-1.5 block">Servings</label>
                    <input
                      type="number" min={0.5} step={0.5} value={servings}
                      onChange={(e) => setServings(Number(e.target.value))}
                      className="w-full px-4 py-2.5 text-sm border border-[#e5e7eb] rounded-xl bg-white focus:outline-none focus:border-[#2d6a4f]"
                    />
                  </div>
                  <button
                    onClick={handleAddMeal}
                    disabled={!selectedRecipe}
                    className="w-full py-2.5 bg-[#2d6a4f] text-white text-sm rounded-xl hover:bg-[#1b4332] transition-colors disabled:opacity-50"
                  >
                    Log meal
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. banana, chicken breast…"
                        value={foodQuery}
                        onChange={(e) => setFoodQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && searchFood()}
                        className="flex-1 px-4 py-2.5 text-sm border border-[#e5e7eb] rounded-xl bg-white focus:outline-none focus:border-[#2d6a4f]"
                      />
                      <button
                        onClick={searchFood}
                        disabled={foodSearching}
                        className="px-4 py-2.5 bg-[#2d6a4f] text-white text-sm rounded-xl hover:bg-[#1b4332] transition-colors disabled:opacity-50"
                      >
                        {foodSearching ? "…" : <Search size={14} />}
                      </button>
                    </div>
                    <p className="text-xs text-[#9ca3af] mt-1">Powered by Open Food Facts</p>
                  </div>

                  {foodResults.length > 0 && !selectedFood && (
                    <div className="flex flex-col gap-1.5 mb-4 max-h-48 overflow-y-auto">
                      {foodResults.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setSelectedFood(f)}
                          className="text-left px-3 py-2.5 bg-white border border-[#e5e7eb] rounded-xl hover:border-[#2d6a4f] transition-colors"
                        >
                          <p className="text-sm font-medium text-[#0d0d0d] truncate">{f.name}</p>
                          <p className="text-xs text-[#9ca3af]">{f.calories_per_100g} kcal · {f.protein_per_100g}g protein · {f.carbs_per_100g}g carbs · {f.fat_per_100g}g fat per 100g</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedFood && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-[#0d0d0d] truncate flex-1">{selectedFood.name}</p>
                        <button onClick={() => setSelectedFood(null)} className="text-xs text-[#9ca3af] hover:text-[#0d0d0d] ml-2 shrink-0">Change</button>
                      </div>
                      <div className="p-3 bg-[#f0fdf4] rounded-xl border border-[#d1fae5] mb-3 grid grid-cols-4 gap-2 text-center">
                        <div><p className="text-sm font-semibold text-[#2d6a4f]">{Math.round(selectedFood.calories_per_100g * amountG / 100)}</p><p className="text-xs text-[#6b7280]">kcal</p></div>
                        <div><p className="text-sm font-semibold text-[#2d6a4f]">{Math.round(selectedFood.protein_per_100g * amountG / 100 * 10) / 10}g</p><p className="text-xs text-[#6b7280]">protein</p></div>
                        <div><p className="text-sm font-semibold text-[#2d6a4f]">{Math.round(selectedFood.carbs_per_100g * amountG / 100 * 10) / 10}g</p><p className="text-xs text-[#6b7280]">carbs</p></div>
                        <div><p className="text-sm font-semibold text-[#2d6a4f]">{Math.round(selectedFood.fat_per_100g * amountG / 100 * 10) / 10}g</p><p className="text-xs text-[#6b7280]">fat</p></div>
                      </div>
                      <label className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-1.5 block">Amount (grams)</label>
                      <input
                        type="number" min={1} value={amountG}
                        onChange={(e) => setAmountG(Number(e.target.value))}
                        className="w-full px-4 py-2.5 text-sm border border-[#e5e7eb] rounded-xl bg-white focus:outline-none focus:border-[#2d6a4f]"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleAddMeal}
                    disabled={!selectedFood}
                    className="w-full py-2.5 bg-[#2d6a4f] text-white text-sm rounded-xl hover:bg-[#1b4332] transition-colors disabled:opacity-50"
                  >
                    Log meal
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
