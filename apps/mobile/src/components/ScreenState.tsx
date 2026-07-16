import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
export function ScreenState({
  message,
  error = false,
  loading = !error,
}: {
  message: string;
  error?: boolean;
  loading?: boolean;
}) {
  return (
    <View style={styles.root}>
      {loading ? <ActivityIndicator color={colors.forest} /> : null}
      <Text style={[styles.text, error && styles.error]}>{message}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { padding: spacing.xl, alignItems: "center", gap: spacing.md },
  text: { color: colors.muted, textAlign: "center" },
  error: { color: colors.danger },
});
