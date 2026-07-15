import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { colors, spacing } from "@sprout/design-tokens";
import { AppButton } from "../../components/AppButton";
import { TextField } from "../../components/TextField";
import { useAuth } from "../../providers/AuthProvider";
import { useTheme } from "../../providers/ThemeProvider";
import { useUsernameOnboarding } from "./useUsernameOnboarding";

export function UsernameOnboardingScreen(): React.JSX.Element {
  const { user, loading, signOut } = useAuth();
  const theme = useTheme();
  const onboarding = useUsernameOnboarding();
  const [username, setUsername] = useState("");

  if (!loading && !user) return <Redirect href="/(auth)/login" />;
  if (user && onboarding.status === "complete") return <Redirect href="/(tabs)/forest" />;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={styles.icon}>🌱</Text>
          <Text style={[styles.title, { color: theme.text }]}>Choose your username</Text>
          <Text style={[styles.copy, { color: theme.muted }]}>
            This is how other gardeners will find you. Choose carefully—your username becomes
            permanent after you continue.
          </Text>
          {onboarding.status === "error" ? (
            <>
              <Text style={styles.error}>{onboarding.error}</Text>
              <AppButton label="Try again" onPress={() => void onboarding.refresh()} />
            </>
          ) : (
            <>
              <TextField
                label="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={50}
                editable={!onboarding.busy && onboarding.status === "required"}
              />
              {onboarding.error ? <Text style={styles.error}>{onboarding.error}</Text> : null}
              <AppButton
                label={onboarding.busy ? "Setting username…" : "Set permanent username"}
                disabled={onboarding.busy || onboarding.status !== "required"}
                onPress={() => void onboarding.chooseUsername(username)}
              />
            </>
          )}
          <AppButton
            label="Sign out"
            tone="quiet"
            disabled={onboarding.busy}
            onPress={() => void signOut()}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
  },
  icon: { fontSize: 52, textAlign: "center" },
  title: { fontSize: 30, fontFamily: "Outfit_700Bold", textAlign: "center" },
  copy: { lineHeight: 21, textAlign: "center" },
  error: { color: colors.danger, textAlign: "center" },
});
