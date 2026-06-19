import { Redirect } from "expo-router";
import { useAuthStore } from "@/lib/auth";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a2e1a" }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return <Redirect href={user ? "/(tabs)" : "/(auth)/login"} />;
}
