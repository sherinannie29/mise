"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Flame, Sparkles, ShoppingCart, Plus, ChevronRight, X } from "lucide-react";
import { useRecipeStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useGroceryStore } from "@/lib/grocery";

const GOAL_KEY = "mise-calorie-goal";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const recipes = useRecipeStore((s) => s.recipes);
  const fetchRecipes = useRecipeStore((s) => s.fetchRecipes);
  const user = useAuthStore((s) => s.user);
  const { lists, fetchLists, addItem, createList, getListItems } = useGroceryStore();

  const [todayCalories, setTodayCalories] = useState(0);
  const [goal, setGoal] = useState(2000);
  const [showGroceryModal, setShowGroceryModal] = useState(false);
  const [groceryItem, setGroceryItem] = useState("");
  const [selectedListId, setSelectedListId] = useState("");
  const [addingGrocery, setAddingGrocery] = useState(false);
  const groceryInputRef = useRef<HTMLInputElement>(null);
  const [previewItems, setPreviewItems] = useState<{ id: string; name: string; checked: boolean }[]>([]);

  const firstName = (user?.user_metadata?.full_name ?? user?.email ?? "").split(" ")[0].split("@")[0];

  useEffect(() => {
    fetchRecipes();
    fetchLists();
    const saved = localStorage.getItem(GOAL_KEY);
    if (saved) setGoal(Number(saved));
    loadTodayCalories();
  }, []);

  useEffect(() => {
    if (lists.length > 0) {
      getListItems(lists[0].id).then(setPreviewItems);
    }
  }, [lists.length]);

  const loadTodayCalories = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("meal_logs")
      .select("*, recipe:recipe_id(calories)")
      .eq("user_id", user.id)
      .gte("logged_at", `${today}T00:00:00`)
      .lte("logged_at", `${today}T23:59:59`);
    if (!data) return;
    const total = data.reduce((sum: number, m: any) => {
      if (m.food_data) return sum + Math.round((m.food_data.calories_per_100g * m.food_data.amount_g) / 100);
      return sum + (m.recipe?.calories ?? 0) * (m.servings ?? 1);
    }, 0);
    setTodayCalories(Math.round(total));
  };

  const recentlyCooked = [...recipes]
    .filter((r) => r.cooked > 0)
    .sort((a, b) => b.cooked - a.cooked)
    .slice(0, 3);

  const caloriePercent = Math.min((todayCalories / goal) * 100, 100);
  const overGoal = todayCalories > goal;

  const handleAddGrocery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groceryItem.trim() || !selectedListId) return;
    setAddingGrocery(true);
    await addItem(selectedListId, groceryItem.trim());
    setGroceryItem("");
    setAddingGrocery(false);
    setShowGroceryModal(false);
  };

  const openGroceryModal = () => {
    if (lists.length > 0) setSelectedListId(lists[0].id);
    setShowGroceryModal(true);
    setTimeout(() => groceryInputRef.current?.focus(), 100);
  };

  const quickActions = [
    { href: "/nutrition?add=1", icon: Flame, label: "Log a meal", sub: "Track your meals" },
    { href: "/recommendations", icon: Sparkles, label: "For You", sub: "AI picks" },
  ];

  return (
    <div className="min-h-screen relative">
      <img
        src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=80"
        alt=""
        className="fixed inset-0 w-full h-full object-cover -z-10"
        style={{ filter: "blur(18px) brightness(0.7) saturate(0.8)", transform: "scale(1.15)" }}
      />
      <div className="fixed inset-0 -z-10" style={{ background: "rgba(5, 20, 10, 0.45)" }} />

      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Greeting */}
        <div className="mb-10">
          <p className="text-white/60 text-sm mb-1">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1 className="text-4xl text-white font-bold tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
            {getGreeting()}{firstName ? `, ${firstName}` : ""}.
          </h1>
        </div>

        {/* Today's calories card */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.7)" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-0.5">Today's calories</p>
              <p className="text-2xl font-bold text-[#111827]">{todayCalories} <span className="text-base font-normal text-[#6b7280]">/ {goal} kcal</span></p>
            </div>
            <Link href="/nutrition" className="flex items-center gap-1 text-xs text-[#2d6a4f] font-medium hover:underline">
              Log meal <ChevronRight size={13} />
            </Link>
          </div>
          <div className="w-full bg-[#e5e7eb] rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full transition-all"
              style={{ width: `${caloriePercent}%`, background: overGoal ? "#ef4444" : "#2d6a4f" }}
            />
          </div>
          {todayCalories === 0 && (
            <p className="text-xs text-[#9ca3af] mt-2">Nothing logged yet today.</p>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {quickActions.map(({ href, icon: Icon, label, sub }) => (
            <Link
              key={href}
              href={href}
              className="rounded-2xl p-4 flex flex-col gap-3 transition-all hover:scale-[1.02]"
              style={{ background: "rgba(45,106,79,0.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <Icon size={20} className="text-white/80" />
              <div>
                <p className="text-white font-semibold text-sm">{label}</p>
                <p className="text-white/60 text-xs mt-0.5">{sub}</p>
              </div>
            </Link>
          ))}
          <button
            onClick={openGroceryModal}
            className="rounded-2xl p-4 flex flex-col gap-3 transition-all hover:scale-[1.02] text-left"
            style={{ background: "rgba(45,106,79,0.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <ShoppingCart size={20} className="text-white/80" />
            <div>
              <p className="text-white font-semibold text-sm">Add to grocery</p>
              <p className="text-white/60 text-xs mt-0.5">Quick add item</p>
            </div>
          </button>
        </div>

        {/* Recently cooked */}
        {recentlyCooked.length > 0 && (
          <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.7)" }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">Most cooked</p>
              <Link href="/recipes" className="text-xs text-[#2d6a4f] font-medium hover:underline flex items-center gap-1">
                All recipes <ChevronRight size={13} />
              </Link>
            </div>
            <div className="space-y-3">
              {recentlyCooked.map((r) => (
                <Link key={r.id} href="/recipes" className="flex items-center justify-between group">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncate group-hover:text-[#2d6a4f] transition-colors" style={{ fontFamily: "Georgia, serif" }}>{r.title}</p>
                    <p className="text-xs text-[#6b7280]">{r.cuisine} · {r.prepTime + r.cookTime} min</p>
                  </div>
                  <span className="text-xs text-[#2d6a4f] font-medium shrink-0 ml-4">Cooked {r.cooked}×</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Grocery list preview */}
        {lists.length > 0 && (
          <div className="rounded-2xl p-6 mt-6" style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.7)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">Grocery</p>
                <p className="text-sm font-semibold text-[#111827] mt-0.5">{lists[0].name}</p>
              </div>
              <Link href={`/grocery/${lists[0].id}`} className="text-xs text-[#2d6a4f] font-medium hover:underline flex items-center gap-1">
                View all <ChevronRight size={13} />
              </Link>
            </div>
            {previewItems.length === 0 ? (
              <p className="text-sm text-[#9ca3af]">No items yet.</p>
            ) : (
              <ul className="space-y-2">
                {previewItems.filter((i) => !i.checked).slice(0, 5).map((item) => (
                  <li key={item.id} className="flex items-center gap-2.5 text-sm text-[#374151]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2d6a4f] shrink-0" />
                    {item.name}
                  </li>
                ))}
                {previewItems.filter((i) => !i.checked).length > 5 && (
                  <li className="text-xs text-[#9ca3af] pl-4">+{previewItems.filter((i) => !i.checked).length - 5} more</li>
                )}
                {previewItems.filter((i) => !i.checked).length === 0 && (
                  <li className="text-sm text-[#9ca3af]">All items checked off!</li>
                )}
              </ul>
            )}
          </div>
        )}

        {/* Empty state — no recipes yet */}
        {recipes.length === 0 && (
          <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.7)" }}>
            <p className="text-[#374151] font-medium mb-1">No recipes yet</p>
            <p className="text-sm text-[#6b7280] mb-4">Start by adding your first recipe.</p>
            <Link href="/add" className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2d6a4f] text-white text-sm rounded-xl hover:bg-[#1b4332] transition-colors">
              <Plus size={14} /> Add recipe
            </Link>
          </div>
        )}

      </div>

      {/* Grocery quick-add modal */}
      {showGroceryModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowGroceryModal(false)}>
          <div className="absolute inset-0 bg-black/20" style={{ backdropFilter: "blur(6px)" }} />
          <div
            className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl p-6"
            style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.6)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-[#111827]">Add grocery item</h2>
              <button onClick={() => setShowGroceryModal(false)} className="p-1.5 text-[#6b7280] hover:text-[#111827] transition-colors">
                <X size={18} />
              </button>
            </div>

            {lists.length === 0 ? (
              <p className="text-sm text-[#6b7280]">No grocery lists yet. <Link href="/grocery" className="text-[#2d6a4f] underline">Create one first.</Link></p>
            ) : (
              <form onSubmit={handleAddGrocery} className="space-y-3">
                <select
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] rounded-xl bg-white focus:outline-none focus:border-[#2d6a4f] text-[#111827]"
                >
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
                <input
                  ref={groceryInputRef}
                  type="text"
                  placeholder="e.g. Olive oil, 2 lemons…"
                  value={groceryItem}
                  onChange={(e) => setGroceryItem(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] rounded-xl bg-white focus:outline-none focus:border-[#2d6a4f] text-[#111827]"
                />
                <button
                  type="submit"
                  disabled={addingGrocery || !groceryItem.trim()}
                  className="w-full py-2.5 bg-[#2d6a4f] text-white text-sm rounded-xl hover:bg-[#1b4332] transition-colors disabled:opacity-50 font-medium"
                >
                  {addingGrocery ? "Adding…" : "Add item"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
