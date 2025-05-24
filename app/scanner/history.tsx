import { View, Text, ScrollView, StyleSheet,SafeAreaView } from "react-native";
import { scannedHistory } from "./index";
import { Button } from "react-native";
export default function HistoryScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📚 Istoric scanări</Text>
      {scannedHistory.length === 0 ? (
        <Text style={styles.item}>Nicio scanare efectuată.</Text>
      ) : (
        scannedHistory.map((entry, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.url}>{entry.url}</Text>
            {entry.warnings.length > 0 ? (
              <Text style={styles.warning}>⚠️ Link suspect:</Text>
            ) : (
              <Text style={styles.safe}>✅ Link sigur</Text>
            )}
            {entry.warnings.map((w, i) => (
              <Text key={i} style={styles.warningItem}>{w}</Text>
            ))}
            <Text style={styles.timestamp}>📅 {entry.timestamp}</Text>
            <Text style={styles.type}>📦 Tip: {entry.type}</Text>

          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  url: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  safe: {
    color: "green",
    fontWeight: "bold",
  },
  warning: {
    color: "red",
    fontWeight: "bold",
  },
  warningItem: {
    color: "#c00",
    fontSize: 12,
  },
  timestamp: {
    fontSize: 12,
    color: "#555",
    marginBottom: 4,
  },
  type: {
    fontSize: 13,
    color: "#333",
    marginBottom: 4,
    fontStyle: "italic",
  },
});