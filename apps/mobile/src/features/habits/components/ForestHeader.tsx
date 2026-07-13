import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { useTheme } from "../../../providers/ThemeProvider";

export function ForestHeader({
  gardenerName,
  online,
  syncing,
  pending,
}: {
  gardenerName: string;
  online: boolean;
  syncing: boolean;
  pending: number;
}): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={styles.root}>
      <Text style={[styles.eyebrow, theme.dark && styles.dark]}>YOUR NURSERY</Text>
      <Text style={[styles.title, { color: theme.text }]}>{gardenerName}&apos;s Nursery</Text>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Grow your virtual forest by maintaining real-life consistency.
      </Text>
      {!online || pending > 0 ? (
        <Text accessibilityLiveRegion="polite" style={styles.sync}>
          {syncing
            ? "Syncing garden…"
            : `${pending} change${pending === 1 ? "" : "s"} waiting to sync`}
        </Text>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  root: { padding: spacing.lg, paddingTop: spacing.xl },
  eyebrow: { color: colors.forest, fontSize: 12, fontFamily: "Outfit_700Bold", letterSpacing: 1.5 },
  dark: { color: "#9BCB8E" },
  title: { fontSize: 34, fontFamily: "Outfit_700Bold", marginTop: spacing.xs },
  subtitle: { marginTop: spacing.xs },
  sync: {
    alignSelf: "flex-start",
    color: colors.evergreen,
    backgroundColor: colors.leaf,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 12,
    marginTop: spacing.sm,
  },
});
