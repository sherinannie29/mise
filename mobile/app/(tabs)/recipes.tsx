import { View, Text, StyleSheet } from "react-native";

export default function Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>urecipes</Text>
      <Text style={styles.sub}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a2e1a", justifyContent: "center", alignItems: "center" },
  text: { fontSize: 28, fontWeight: "700", color: "#fff", marginBottom: 8 },
  sub: { fontSize: 14, color: "rgba(255,255,255,0.5)" },
});
