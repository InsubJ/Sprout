import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Profile } from "@sprout/shared";
import { colors, spacing } from "@sprout/design-tokens";
import { useTheme } from "../../providers/ThemeProvider";

export function FriendGardenHeader({
  profile,
  active,
  onLeave,
  onOpenForest,
  onOpenSanctuary,
}: {
  profile: Profile;
  active: "forest" | "sanctuary";
  onLeave(): void;
  onOpenForest(): void;
  onOpenSanctuary(): void;
}) {
  const theme = useTheme();
  const name = profile.display_name || profile.username;
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to Buds"
        onPress={onLeave}
        style={({ pressed }) => [styles.leave, pressed && styles.pressed]}
      >
        <Text style={[styles.leaveText, { color: theme.dark ? "#9BCB8E" : colors.forest }]}>
          ← Back to Buds
        </Text>
      </Pressable>
      <Text style={[styles.title, { color: theme.text }]}>{name}'s Garden</Text>
      <Text style={{ color: theme.muted }}>@{profile.username} · connected bud</Text>
      <View
        accessibilityRole="tablist"
        style={[styles.tabs, { backgroundColor: theme.elevated, borderColor: theme.border }]}
      >
        <GardenOption label="Forest" selected={active === "forest"} onPress={onOpenForest} />
        <GardenOption
          label="Sanctuary"
          selected={active === "sanctuary"}
          onPress={onOpenSanctuary}
        />
      </View>
    </View>
  );
}

function GardenOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress(): void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.tab, selected && styles.tabSelected]}
    >
      <Text style={[styles.tabText, { color: selected ? colors.paper : theme.muted }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, paddingTop: spacing.xl, gap: spacing.xs },
  leave: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center" },
  leaveText: { fontFamily: "Outfit_700Bold" },
  pressed: { opacity: 0.65 },
  title: { fontSize: 32, fontFamily: "Outfit_700Bold" },
  tabs: {
    marginTop: spacing.md,
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  tabSelected: { backgroundColor: colors.forest },
  tabText: { fontFamily: "Outfit_700Bold" },
});
