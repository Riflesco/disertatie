import { CameraView } from "expo-camera";
import { Stack, useRouter } from "expo-router";
import {
  Alert,
  AppState,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { Overlay } from "./Overlay";
import { useEffect, useRef, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Button } from "react-native";

export const scannedHistory: {
  url: string;
  warnings: string[];
  timestamp: string;
  type: string;
}[] = [];

export default function Home() {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const router = useRouter();
  const [overlayKey, setOverlayKey] = useState(0);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setOverlayKey((prev) => prev + 1); 
    }, [])
  );

  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <Stack.Screen
        options={{
          title: "Scanner QR",
          headerRight: () => (
            <Button
              title="Istoric"
              onPress={() => router.push("/scanner/history")}
            />
          ),
        }}
      />
      {Platform.OS === "android" ? <StatusBar hidden /> : null}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={async ({ data }) => {
          if (data && !qrLock.current) {
            qrLock.current = true;
            const type = getContentType(data);
            let warnings: string[] = [];

            if (type === "Link") {
              warnings = await isSuspiciousUrl(data);
            } else if (type === "WiFi") {
              warnings = checkWifiQrSecurity(data);
            }

            const now = new Date();
            const timestamp = now.toLocaleString();

            scannedHistory.unshift({
              url: data,
              warnings,
              timestamp,
              type,
            });

            if (warnings.length > 0) {
              Alert.alert("🚨 Conținut suspect detectat!", warnings.join("\n\n"), [
                {
                  text: "Anulează",
                  style: "cancel",
                  onPress: () => (qrLock.current = false),
                },
                {
                  text: "Continuă oricum",
                  style: "destructive",
                  onPress: () => {
                    if (type === "Link") {
                      Linking.openURL(data);
                    } else {
                      Alert.alert("ℹ️ QR Wi-Fi detectat", "Conectarea se face manual.");
                    }
                  },
                },
              ]);
            } else {
              if (type === "Link") {
                Linking.openURL(data);
              } else {
                Alert.alert("ℹ️ QR Wi-Fi detectat", "Nu au fost găsite probleme.");
              }
            }
          }
        }}
      />
      <Overlay key={overlayKey} />
    </SafeAreaView>
  );
}

const getContentType = (data: string): string => {
  if (data.startsWith("WIFI:")) return "WiFi";
  if (data.startsWith("BEGIN:VCARD")) return "Contact";
  try {
    const parsed = new URL(data);
    if (parsed.protocol.startsWith("http")) return "Link";
  } catch {
    // not a valid URL
  }
  return "Text";
};

const isSuspiciousUrl = async (url: string): Promise<string[]> => {
  const warnings: string[] = [];

  try {
    const parsed = new URL(url);

    if (url.length > 100) warnings.push("⚠️ URL foarte lung – poate ascunde ceva.");

    const atMatch = url.match(/https?:\/\/([^\/@]+)@([^\/]+)/);
    if (atMatch) {
      const beforeAt = atMatch[1];
      const afterAt = atMatch[2];
      if (beforeAt.includes(":")) {
        warnings.push("⚠️ URL cu utilizator/parolă – poate fi înșelător.");
      } else {
        warnings.push(`⚠️ Caracter '@' detectat – pare a ascunde domeniul real:\n${afterAt}`);
        warnings.push(`⚠️ URL scanat :\n${url}`);
      }
    }

    const redirectMatch = /(?:redirect|url|destination)=([^&]+)/.exec(url);
    if (redirectMatch) {
      const redirectUrl = decodeURIComponent(redirectMatch[1]);
      warnings.push(`⚠️ Redirecționare către: ${redirectUrl}`);
    }

    if (/%[0-9A-F]{2}/i.test(url)) {
      warnings.push("⚠️ URL cu caractere codate – poate masca intenția.");
    }

    if (isShortenedUrl(url)) {
      const expanded = await expandUrl(url);
      if (expanded && expanded !== url) {
        warnings.push(`🔍 Link scurtat detectat – redirectează spre:\n${expanded}`);
      }
    }

    if (!parsed.protocol.startsWith("https")) {
      warnings.push("⚠️ Conexiune nesecurizată (nu este HTTPS)");
    }
  } catch {
    // Nu e URL valid 
  }

  return warnings;
};

const isShortenedUrl = (url: string): boolean => {
  const knownShorteners = [
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "rebrand.ly",
    "is.gd",
    "buff.ly",
    "ow.ly",
    "cutt.ly",
  ];
  return knownShorteners.some((short) => url.includes(short));
};

const expandUrl = async (shortUrl: string): Promise<string | null> => {
  try {
    const response = await fetch(shortUrl, {
      method: "HEAD",
      redirect: "follow",
    });
    return response.url || null;
  } catch {
    return null;
  }
};

const checkWifiQrSecurity = (data: string): string[] => {
  const warnings: string[] = [];

  const ssidMatch = data.match(/S:([^;]*)/);
  const passwordMatch = data.match(/P:([^;]*)/);
  const encryptionMatch = data.match(/T:([^;]*)/);

  const ssid = ssidMatch?.[1] || "";
  const password = passwordMatch?.[1] || "";
  const encryption = encryptionMatch?.[1] || "";

  if (encryption.toLowerCase() === "nopass") {
    warnings.push("⚠️ Rețea fără parolă – conexiunile sunt nesecurizate.");
  }

  if (password.length > 0 && password.length < 8) {
    warnings.push("⚠️ Parolă Wi-Fi foarte scurtă – nesigură.");
  }

  if (["12345678", "password", "admin123"].includes(password.toLowerCase())) {
    warnings.push("⚠️ Parolă comună sau slabă – ușor de ghicit.");
  }

  if (/free|gratis|liber/i.test(ssid)) {
    warnings.push(`⚠️ Numele rețelei („${ssid}”) sugerează acces gratuit – verifică autenticitatea.`);
  }

  if (ssid.length === 0) {
    warnings.push("⚠️ SSID lipsă – codul poate fi malformat.");
  }
  if (/https?:\/\//i.test(data)) {
  warnings.push("⚠️ Codul QR Wi-Fi conține și un link – poate fi un atac mascat.");
  }
  return warnings;
};