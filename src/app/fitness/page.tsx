"use client";

import { useState } from "react";
import { Zap, Footprints, Flame, Clock, TrendingUp, Plus, X } from "lucide-react";
import Link from "next/link";

const STEP_KEY = "mise-steps";

const PLACEHOLDER_WORKOUTS = [
  { id: 1, type: "Run", date: "Today", distance: 5.2, duration: 28, calories: 312, pace: "5:22" },
  { id: 2, type: "Cycling", date: "Yesterday", distance: 18.4, duration: 52, calories: 480, pace: "21.2 km/h" },
  { id: 3, type: "Run", date: "Mon", distance: 8.0, duration: 43, calories: 510, pace: "5:22" },
  { id: 4, type: "Swimming", date: "Sun", distance: 1.5, duration: 38, calories: 290, pace: "2:32/100m" },
];

const WEEK_DATA = [
  { day: "Mon", minutes: 43 },
  { day: "Tue", minutes: 0 },
  { day: "Wed", minutes: 0 },
  { day: "Thu", minutes: 52 },
  { day: "Fri", minutes: 0 },
  { day: "Sat", minutes: 0 },
  { day: "Sun", minutes: 38 },
];

const typeColor: Record<string, string> = {
  Run: "#2d6a4f",
  Cycling: "#1e6091",
  Swimming: "#0e7490",
};

const typeIcon: Record<string, string> = {
  Run: "🏃",
  Cycling: "🚴",
  Swimming: "🏊",
};

const card = { background: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.7)" };

export default function FitnessPage() {
  const [steps, setSteps] = useState(() => {
    if (typeof window !== "undefined") {
      return Number(localStorage.getItem(STEP_KEY) ?? 0);
    }
    return 0;
  });
  const [editingSteps, setEditingSteps] = useState(false);
  const [stepsInput, setStepsInput] = useState("");
  const stepGoal = 10000;
  const stepPercent = Math.min((steps / stepGoal) * 100, 100);

  const handleSaveSteps = () => {
    const val = Number(stepsInput);
    if (val >= 0) {
      setSteps(val);
      localStorage.setItem(STEP_KEY, String(val));
    }
    setEditingSteps(false);
  };

  const totalWeeklyMinutes = WEEK_DATA.reduce((s, d) => s + d.minutes, 0);
  const totalWeeklyCalories = PLACEHOLDER_WORKOUTS.reduce((s, w) => s + w.calories, 0);
  const maxMinutes = Math.max(...WEEK_DATA.map((d) => d.minutes), 1);

  return (
    <div className="min-h-screen relative">
      <img
        src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=80"
        alt=""
        className="fixed inset-0 w-full h-full object-cover -z-10"
        style={{ filter: "blur(18px) brightness(0.7) saturate(0.8)", transform: "scale(1.15)" }}
      />
      <div className="fixed inset-0 -z-10" style={{ background: "rgba(5, 20, 10, 0.45)" }} />

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-white font-bold tracking-tight" style={{ fontFamily: "Georgia, serif" }}>Fitness</h1>
            <p className="text-white/60 text-sm mt-1">Connect Strava to sync workouts automatically</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-xl border border-white/30 hover:bg-white/10 transition-colors" style={{ background: "rgba(255,255,255,0.1)" }}>
            <Zap size={14} />
            Connect Strava
          </button>
        </div>

        {/* Steps card */}
        <div className="rounded-2xl p-6 mb-4" style={card}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Footprints size={18} className="text-[#2d6a4f]" />
              <p className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">Steps today</p>
            </div>
            <button onClick={() => { setStepsInput(String(steps)); setEditingSteps(true); }} className="text-xs text-[#2d6a4f] font-medium hover:underline flex items-center gap-1">
              <Plus size={12} /> Log steps
            </button>
          </div>

          {editingSteps ? (
            <div className="flex gap-2 items-center">
              <input
                autoFocus
                type="number"
                value={stepsInput}
                onChange={(e) => setStepsInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveSteps(); if (e.key === "Escape") setEditingSteps(false); }}
                className="flex-1 px-3 py-2 text-sm border border-[#e5e7eb] rounded-xl focus:outline-none focus:border-[#2d6a4f] bg-white"
                placeholder="e.g. 8000"
              />
              <button onClick={handleSaveSteps} className="px-4 py-2 bg-[#2d6a4f] text-white text-sm rounded-xl hover:bg-[#1b4332] transition-colors">Save</button>
              <button onClick={() => setEditingSteps(false)} className="p-2 text-[#9ca3af] hover:text-[#374151]"><X size={16} /></button>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-[#111827] mb-3">{steps.toLocaleString()} <span className="text-base font-normal text-[#6b7280]">/ {stepGoal.toLocaleString()}</span></p>
              <div className="w-full bg-[#e5e7eb] rounded-full h-2.5">
                <div className="h-2.5 rounded-full bg-[#2d6a4f] transition-all" style={{ width: `${stepPercent}%` }} />
              </div>
              <p className="text-xs text-[#9ca3af] mt-1.5">{steps === 0 ? "No steps logged yet — tap Log steps above" : `${Math.round(stepPercent)}% of daily goal`}</p>
            </>
          )}
        </div>

        {/* Weekly summary */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Active minutes", value: `${totalWeeklyMinutes}`, unit: "min", icon: Clock },
            { label: "Calories burned", value: `${totalWeeklyCalories}`, unit: "kcal", icon: Flame },
            { label: "Workouts", value: `${PLACEHOLDER_WORKOUTS.length}`, unit: "this week", icon: TrendingUp },
          ].map(({ label, value, unit, icon: Icon }) => (
            <div key={label} className="rounded-2xl p-4 text-center" style={card}>
              <Icon size={16} className="text-[#2d6a4f] mx-auto mb-2" />
              <p className="text-xl font-bold text-[#111827]">{value}</p>
              <p className="text-xs text-[#6b7280] mt-0.5">{unit}</p>
              <p className="text-xs text-[#9ca3af] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Activity chart */}
        <div className="rounded-2xl p-6 mb-4" style={card}>
          <p className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-4">This week</p>
          <div className="flex items-end gap-2 h-24">
            {WEEK_DATA.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{
                    height: d.minutes > 0 ? `${Math.max((d.minutes / maxMinutes) * 100, 8)}%` : "4px",
                    background: d.minutes > 0 ? "#2d6a4f" : "#e5e7eb",
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            {WEEK_DATA.map((d) => (
              <div key={d.day} className="flex-1 text-center">
                <span className="text-xs font-medium text-[#4b5563]">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent workouts */}
        <div className="rounded-2xl p-6" style={card}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">Recent workouts</p>
            <span className="text-xs text-[#9ca3af]">Placeholder data</span>
          </div>
          <div className="space-y-3">
            {PLACEHOLDER_WORKOUTS.map((w) => (
              <div key={w.id} className="flex items-center gap-4 py-3 border-b border-[#f3f4f6] last:border-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: `${typeColor[w.type]}18` }}>
                  {typeIcon[w.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111827]">{w.type}</p>
                  <p className="text-xs text-[#6b7280]">{w.date} · {w.pace}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-[#111827]">{w.distance} km</p>
                  <p className="text-xs text-[#6b7280]">{w.duration} min · {w.calories} kcal</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
