import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { generatedHistory } from "./generatedHistory";
import { Link } from "expo-router";

export default function GenerateQRScreen() {
  const [text, setText] = useState("");

  const handleGenerate = () => {
    if (!text.trim()) return;

    generatedHistory.unshift({
      value: text,
      timestamp: new Date().toLocaleString(),
    });

    setText(""); 
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🔤 Generează QR Code</Text>

      <TextInput
        style={styles.input}
        placeholder="Introdu textul..."
        value={text}
        onChangeText={setText}
      />

      <Button title="Generează și salvează în istoric" onPress={handleGenerate} />

      {text.trim() !== "" && (
        <View style={styles.qrContainer}>
          <QRCode value={text} size={200} />
        </View>
      )}

      <Link href="/scanner/generatedHistoryScreen" asChild>
        <Pressable>
          <Text style={{ color: "#0E7AFE", marginTop: 20, textAlign: "center" }}>
            Vezi Istoric Generări
          </Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  qrContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
});