import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { demoIdentities } from "../../providers/AuthProvider";
import { useIsDemoMode } from "../../providers/ServicesProvider";
import { useTheme } from "../../providers/ThemeProvider";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { useGoogleAuthentication } from "./useGoogleAuthentication";

export function AuthScreen(): React.JSX.Element {
  const isDemo = useIsDemoMode();
  const theme = useTheme();
  const authentication = useGoogleAuthentication();
  return (
    <ScrollView
      contentContainerStyle={[styles.content, { backgroundColor: theme.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={styles.logo}>🌱</Text>
        <Text style={[styles.title, { color: theme.text }]}>Welcome to Sprout</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Cultivate your habits, grow a beautiful virtual forest, and connect with your buds.
        </Text>
        <GoogleSignInButton
          disabled={authentication.busy}
          onError={authentication.reportError}
          onIdToken={(credential) => void authentication.signInWithGoogleIdToken(credential)}
          onOAuthPress={() => void authentication.signInWithGoogleOAuth()}
        />
        {authentication.busy ? (
          <Text accessibilityLiveRegion="polite" style={[styles.status, { color: theme.muted }]}>
            Signing in with Google…
          </Text>
        ) : null}
        {authentication.error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {authentication.error}
          </Text>
        ) : null}
        <Text style={[styles.usernameNotice, { color: theme.muted }]}>
          New gardeners choose a permanent username after Google sign-in.
        </Text>
        {isDemo ? (
          <View
            style={[styles.demo, { backgroundColor: theme.elevated, borderColor: theme.border }]}
          >
            <Text style={[styles.demoLabel, { color: theme.muted }]}>
              Offline Mode — choose a demo profile:
            </Text>
            <View style={styles.demoChips}>
              {demoIdentities.map((identity) => (
                <Pressable
                  key={identity.id}
                  accessibilityLabel={`Continue as ${identity.username}`}
                  accessibilityRole="button"
                  disabled={authentication.busy}
                  onPress={() => void authentication.signInDemo(identity)}
                  style={({ pressed }) => [
                    styles.demoChip,
                    { borderColor: theme.border, backgroundColor: theme.surface },
                    pressed && styles.pressed,
                    authentication.busy && styles.disabled,
                  ]}
                >
                  <Text style={[styles.demoChipText, { color: theme.text }]}>
                    @{identity.username}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  subtitle: { color: colors.muted, textAlign: "center", marginBottom: spacing.lg },
  status: { fontSize: 12, textAlign: "center" },
  usernameNotice: { fontSize: 12, lineHeight: 17, textAlign: "center" },
  error: { color: colors.danger, textAlign: "center" },
  demo: { borderWidth: 1, borderRadius: 18, padding: spacing.md, gap: spacing.sm },
  demoLabel: { textAlign: "center", fontFamily: "Outfit_400Regular" },
  demoChips: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: spacing.sm },
  demoChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  demoChipText: { fontFamily: "Outfit_600SemiBold" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.42 },
});
