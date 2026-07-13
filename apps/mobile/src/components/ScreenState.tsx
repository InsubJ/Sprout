import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
export function ScreenState({ message, error = false }: { message: string; error?: boolean }) {
  return (
    <View style={styles.root}>
      {error ? null : <ActivityIndicator color={colors.forest} />}
      <Text style={[styles.text, error && styles.error]}>{message}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { padding: spacing.xl, alignItems: "center", gap: spacing.md },
  text: { color: colors.muted, textAlign: "center" },
  error: { color: colors.danger },
});
