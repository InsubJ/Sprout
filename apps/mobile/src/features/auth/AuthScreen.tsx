import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  View,
} from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { useRouter } from "expo-router";
import { AppButton } from "../../components/AppButton";
import { TextField } from "../../components/TextField";
import { demoIdentities, useAuth } from "../../providers/AuthProvider";
import { useTheme } from "../../providers/ThemeProvider";
import { useServices } from "../../providers/ServicesProvider";
export function AuthScreen({ mode }: { mode: "login" | "signup" }) {
  const { signIn, signUp, signInDemo, signInWithOAuth } = useAuth();
  const { isDemo } = useServices();
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("gardener@sprout.demo");
  const [password, setPassword] = useState("sprout123");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      router.replace("/(tabs)/forest");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Authentication failed",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={styles.logo}>🌱</Text>
          <Text style={[styles.title, { color: theme.text }]}>
            {mode === "login" ? "Welcome to Sprout" : "Grow with Sprout"}
          </Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}> 
            Cultivate your habits, grow a beautiful virtual forest, and connect with your buds.
          </Text>
          <TextField label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TextField label="Password" secureTextEntry value={password} onChangeText={setPassword} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <AppButton label={busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"} disabled={busy} onPress={() => void run(() => mode === "login" ? signIn(email, password) : signUp(email, password))} />
          <Text style={[styles.or, { color: theme.muted }]}>or continue with</Text>
          <AppButton label="🔑 Continue with Google" tone="quiet" disabled={busy} onPress={() => void run(() => signInWithOAuth("google"))} />
          {Platform.OS === "ios" ? <AppButton label="Apple" tone="quiet" disabled={busy} onPress={() => void run(() => signInWithOAuth("apple"))} /> : null}
          {isDemo && mode === "login" ? <View style={[styles.demo,{backgroundColor:theme.elevated,borderColor:theme.border}]}><Text style={[styles.demoLabel,{color:theme.muted}]}>Offline Mode — choose a demo profile:</Text><View style={styles.demoChips}>{demoIdentities.map(identity=><Pressable key={identity.id} accessibilityRole="button" accessibilityLabel={`Continue as ${identity.username}`} onPress={()=>void run(()=>signInDemo(identity))} style={[styles.demoChip,{borderColor:theme.border,backgroundColor:theme.surface}]}><Text style={{color:theme.text,fontFamily:"Outfit_600SemiBold"}}>@{identity.username}</Text></Pressable>)}</View></View>:null}
          <AppButton tone="quiet" label={mode === "login" ? "Create an account" : "I already have an account"} onPress={() => router.replace(mode === "login" ? "/(auth)/signup" : "/(auth)/login")} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 460,
    borderWidth: 1,
    borderRadius: 28,
    padding: spacing.xl,
    gap: spacing.md,
    shadowColor: "#13251A",
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  logo: { fontSize: 52, textAlign: "center" },
  title: {
    color: colors.ink,
    fontSize: 32,
    fontFamily: "Outfit_700Bold",
    textAlign: "center",
  },
  subtitle: {
    color: colors.muted,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  or: { color: colors.muted, textAlign: "center", fontSize: 12 },
  error: { color: colors.danger, textAlign: "center" },
  demo: { borderWidth: 1, borderRadius: 18, padding: spacing.md, gap: spacing.sm },
  demoLabel: { textAlign: "center", fontFamily: "Outfit_400Regular" },
  demoChips: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: spacing.sm },
  demoChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
});
