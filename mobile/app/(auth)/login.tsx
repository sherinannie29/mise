import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/lib/auth";

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (result.error) {
      Alert.alert("Sign in failed", result.error);
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.inner}>
        <Text style={styles.logo}>Mise</Text>
        <Text style={styles.tagline}>Your personal kitchen companion</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/signup")} style={styles.link}>
          <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkBold}>Sign up</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a2e1a" },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 32 },
  logo: { fontSize: 48, fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: 8, fontStyle: "italic" },
  tagline: { fontSize: 15, color: "rgba(255,255,255,0.55)", textAlign: "center", marginBottom: 48 },
  input: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 15,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#2d6a4f",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  link: { marginTop: 24, alignItems: "center" },
  linkText: { color: "rgba(255,255,255,0.5)", fontSize: 14 },
  linkBold: { color: "#fff", fontWeight: "600" },
});
