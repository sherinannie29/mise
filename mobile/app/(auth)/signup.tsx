import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/lib/auth";

export default function SignupScreen() {
  const signUp = useAuthStore((s) => s.signUp);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !fullName) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    const result = await signUp(email.trim(), password, fullName.trim());
    setLoading(false);
    if (result.error) {
      Alert.alert("Sign up failed", result.error);
    } else {
      Alert.alert("Check your email", "We sent you a confirmation link.", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>Mise</Text>
        <Text style={styles.tagline}>Create your account</Text>

        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={fullName}
          onChangeText={setFullName}
        />
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

        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.link}>
          <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Sign in</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a2e1a" },
  inner: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 32, paddingVertical: 48 },
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
