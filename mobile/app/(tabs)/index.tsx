import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthStore } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const GOAL_KEY = "mise-calorie-goal";
const STEP_GOAL = 10000;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [todayCalories, setTodayCalories] = useState(0);
  const [goal] = useState(2000);
  const [recipeCount, setRecipeCount] = useState(0);

  const firstName = (user?.user_metadata?.full_name ?? user?.email ?? "").split(" ")[0].split("@")[0];
  const caloriePercent = Math.min((todayCalories / goal) * 100, 100);
  const overGoal = todayCalories > goal;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) return;

    const today = new Date().toISOString().split("T")[0];
    const [mealsRes, recipesRes] = await Promise.all([
      supabase.from("meal_logs").select("*, recipe:recipe_id(calories)").eq("user_id", u.id)
        .gte("logged_at", `${today}T00:00:00`).lte("logged_at", `${today}T23:59:59`),
      supabase.from("recipes").select("id", { count: "exact" }).eq("user_id", u.id),
    ]);

    if (mealsRes.data) {
      const total = mealsRes.data.reduce((sum: number, m: any) => {
        if (m.food_data) return sum + Math.round((m.food_data.calories_per_100g * m.food_data.amount_g) / 100);
        return sum + (m.recipe?.calories ?? 0) * (m.servings ?? 1);
      }, 0);
      setTodayCalories(Math.round(total));
    }
    if (recipesRes.count !== null) setRecipeCount(recipesRes.count);
  };

  const quickActions = [
    { label: "Log a meal", icon: "flame-outline" as const, onPress: () => router.push("/(tabs)/nutrition") },
    { label: "For You", icon: "sparkles-outline" as const, onPress: () => {} },
    { label: "Add grocery", icon: "cart-outline" as const, onPress: () => router.push("/(tabs)/grocery") },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.date}>{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</Text>
            <Text style={styles.greeting}>{getGreeting()}{firstName ? `, ${firstName}` : ""}.</Text>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.avatarBtn}>
            <Text style={styles.avatarText}>{firstName[0]?.toUpperCase() ?? "U"}</Text>
          </TouchableOpacity>
        </View>

        {/* Calories card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.cardLabel}>TODAY'S CALORIES</Text>
              <Text style={styles.calorieValue}>{todayCalories} <Text style={styles.calorieGoal}>/ {goal} kcal</Text></Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(tabs)/nutrition")}>
              <Text style={styles.linkText}>Log meal →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${caloriePercent}%`, backgroundColor: overGoal ? "#ef4444" : "#2d6a4f" }]} />
          </View>
          {todayCalories === 0 && <Text style={styles.hintText}>Nothing logged yet today.</Text>}
        </View>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          {quickActions.map((a) => (
            <TouchableOpacity key={a.label} style={styles.quickCard} onPress={a.onPress}>
              <Ionicons name={a.icon} size={22} color="rgba(255,255,255,0.85)" />
              <Text style={styles.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{recipeCount}</Text>
            <Text style={styles.statLabel}>Recipes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Steps</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a2e1a" },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 32 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  date: { fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 },
  greeting: { fontSize: 28, fontWeight: "700", color: "#fff" },
  avatarBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#2d6a4f", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  card: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  cardLabel: { fontSize: 11, fontWeight: "600", color: "#6b7280", letterSpacing: 0.8, marginBottom: 4 },
  calorieValue: { fontSize: 26, fontWeight: "700", color: "#111827" },
  calorieGoal: { fontSize: 15, fontWeight: "400", color: "#6b7280" },
  linkText: { fontSize: 13, color: "#2d6a4f", fontWeight: "600" },
  progressBg: { height: 8, backgroundColor: "#e5e7eb", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  hintText: { fontSize: 12, color: "#9ca3af", marginTop: 8 },

  quickRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  quickCard: {
    flex: 1,
    backgroundColor: "rgba(45,106,79,0.85)",
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  quickLabel: { color: "#fff", fontWeight: "600", fontSize: 13 },

  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
  },
  statValue: { fontSize: 22, fontWeight: "700", color: "#111827" },
  statLabel: { fontSize: 12, color: "#6b7280", marginTop: 2 },
});
