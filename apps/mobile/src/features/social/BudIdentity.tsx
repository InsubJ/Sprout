import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Profile } from "@sprout/shared";
import { colors, radii, spacing } from "@sprout/design-tokens";
import { useTheme } from "../../providers/ThemeProvider";

export function BudIdentity({
  profile,
  action,
  compact = false,
}: {
  profile: Profile;
  action?: ReactNode;
  compact?: boolean;
}): React.JSX.Element {
  const theme = useTheme();
  return (
    <View
      style={[styles.root, !compact && styles.card, !compact && { backgroundColor: theme.surface }]}
    >
      <View style={styles.avatar}>
        <Text>🌿</Text>
      </View>
      <View style={styles.text}>
        <Text style={[styles.name, { color: theme.text }]}>
          {profile.display_name || profile.username}
        </Text>
        <Text style={[styles.username, { color: theme.muted }]}>@{profile.username}</Text>
      </View>
      {action}
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  card: {
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: radii.md,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.leaf,
  },
  text: { flex: 1 },
  name: { fontFamily: "Outfit_700Bold" },
  username: { fontSize: 12 },
});
