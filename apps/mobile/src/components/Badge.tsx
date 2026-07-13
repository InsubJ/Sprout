import { StyleSheet, Text } from "react-native";
import { colors, radii, spacing } from "@sprout/design-tokens";
export function Badge({
  label,
  tone = "forest",
}: {
  label: string;
  tone?: "forest" | "danger" | "disco";
}) {
  return <Text style={[styles.base, styles[tone]]}>{label}</Text>;
}
const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 12,
    fontWeight: "700",
  },
  forest: { color: colors.evergreen, backgroundColor: colors.leaf },
  danger: { color: colors.paper, backgroundColor: colors.danger },
  disco: { color: colors.paper, backgroundColor: colors.purple },
});
