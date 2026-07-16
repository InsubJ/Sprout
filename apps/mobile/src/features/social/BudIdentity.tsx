import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Profile } from "@sprout/shared";
import { radii, spacing } from "@sprout/design-tokens";
import { Avatar } from "../../components/Avatar";
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
  const displayName = profile.display_name || profile.username;
  return (
    <View
      style={[styles.root, !compact && styles.card, !compact && { backgroundColor: theme.surface }]}
    >
      <Avatar uri={profile.avatar_url} label={`${displayName}'s profile picture`} size={42} />
      <View style={styles.text}>
        <Text style={[styles.name, { color: theme.text }]}>{displayName}</Text>
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
  text: { flex: 1 },
  name: { fontFamily: "Outfit_700Bold" },
  username: { fontSize: 12 },
});
