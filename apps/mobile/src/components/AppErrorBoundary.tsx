import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { analytics } from "../services/analyticsService";
interface State {
  error: Error | null;
}
export class AppErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    analytics.captureError(error, info.componentStack ?? "render");
  }
  render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.root}>
        <Text style={styles.icon}>🌧️</Text>
        <Text style={styles.title}>A storm passed through</Text>
        <Text style={styles.copy}>Your garden data is safe. Try returning to the app.</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => this.setState({ error: null })}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonLabel}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.sand,
  },
  icon: { fontSize: 52 },
  title: { color: colors.ink, fontSize: 26, fontWeight: "900" },
  copy: { color: colors.muted, textAlign: "center" },
  button: {
    minHeight: 48,
    borderRadius: 999,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.forest,
  },
  buttonPressed: { opacity: 0.78 },
  buttonLabel: { color: colors.paper, fontFamily: "Outfit_700Bold", fontSize: 16 },
});
