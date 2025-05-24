import { View, Text, ScrollView, StyleSheet } from "react-native";
import { generatedHistory } from "./generatedHistory"; 
import QRCode from "react-native-qrcode-svg";

export default function GeneratedHistoryScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🧾 Istoric Generări</Text>
      {generatedHistory.length === 0 ? (
        <Text style={styles.item}>Nicio generare efectuată.</Text>
      ) : (
        generatedHistory.map((entry, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.value}>🔤 {entry.value}</Text>
            <Text style={styles.timestamp}>📅 {entry.timestamp}</Text>
            <QRCode value={entry.value} size={150} />
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
    backgroundColor: "#f2f2f2",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#555",
    marginBottom: 8,
  },
  item: {
    fontStyle: "italic",
    color: "#666",
  },
});