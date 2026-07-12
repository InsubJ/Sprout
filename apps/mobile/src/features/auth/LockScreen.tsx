import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { spacing } from "@sprout/design-tokens";
import { AppButton } from "../../components/AppButton";
import { TextField } from "../../components/TextField";
import { useAppLock } from "../../providers/AppLockProvider";
import { useAuth } from "../../providers/AuthProvider";
import { useTheme } from "../../providers/ThemeProvider";

type BiometricState = "idle" | "scanning" | "success" | "failure";
export function LockScreen() {
  const { unlock, pinEnabled, biometricsEnabled, unlockWithPin } = useAppLock();
  const { signOut } = useAuth();
  const theme = useTheme();
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [biometric, setBiometric] = useState<BiometricState>("idle");
  const started = useRef(false);
  const scan = useCallback(async () => {
    setBiometric("scanning");
    const success = await unlock();
    if (success) {
      setBiometric("success");
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 600));
    } else setBiometric("failure");
  }, [unlock]);
  useEffect(() => { if (biometricsEnabled && !started.current) { started.current = true; void scan(); } }, [biometricsEnabled, scan]);
  const submitPin = async () => {
    if (!/^\d{4}$/.test(pin)) { setPinError("PIN code must be exactly 4 digits"); return; }
    const success = await unlockWithPin(pin);
    if (!success) { setPinError("Invalid PIN code. Please try again."); return; }
    setPin(""); setPinError(null);
  };
  const scanLabel = biometric === "scanning" ? "Authenticating..." : biometric === "success" ? "Success!" : "Verification Failed";
  const scanCopy = biometric === "scanning" ? "Contacting biometric hardware layer..." : biometric === "success" ? "Lock validation confirmed." : "Failed.";
  return <View style={[styles.root, { backgroundColor: theme.background }]}><View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}><Text style={styles.icon}>🔒</Text><Text style={[styles.title, { color: theme.text }]}>Sprout Locked</Text><Text style={[styles.copy, { color: theme.muted }]}>Please authenticate using your configured lock parameters to access your virtual habits canopy.</Text>{biometric !== "idle" ? <View accessibilityLiveRegion="polite" style={[styles.biometric, { backgroundColor: theme.elevated }]}><Text style={styles.scanIcon}>{biometric === "scanning" ? "🧬" : biometric === "success" ? "✔️" : "❌"}</Text><Text style={[styles.scanTitle, { color: theme.text }]}>{scanLabel}</Text><Text style={{ color: theme.muted }}>{scanCopy}</Text></View> : null}{pinEnabled ? <View style={styles.pin}><TextField label="Four-digit PIN" value={pin} autoFocus secureTextEntry keyboardType="number-pad" maxLength={4} placeholder="••••" onChangeText={(value) => setPin(value.replace(/\D/g, "").slice(0, 4))} error={pinError ?? undefined} /><AppButton label="Unlock Canopy" onPress={() => void submitPin()} /></View> : null}{biometricsEnabled ? <AppButton label="🧬 Scan Biometrics" tone={pinEnabled ? "quiet" : "forest"} disabled={biometric === "scanning"} onPress={() => void scan()} /> : null}<AppButton label="🚪 Sign Out" tone="quiet" onPress={() => void signOut()} /></View></View>;
}
const styles = StyleSheet.create({ root: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg }, card: { width: "100%", maxWidth: 440, borderWidth: 1, borderRadius: 24, padding: spacing.xl, gap: spacing.md }, icon: { fontSize: 54, textAlign: "center" }, title: { fontSize: 28, fontFamily: "Outfit_700Bold", textAlign: "center" }, copy: { textAlign: "center", lineHeight: 22, fontFamily: "Outfit_400Regular" }, pin: { gap: spacing.sm }, biometric: { padding: spacing.md, borderRadius: 16, alignItems: "center", gap: spacing.xs }, scanIcon: { fontSize: 38 }, scanTitle: { fontSize: 18, fontFamily: "Outfit_700Bold" } });
