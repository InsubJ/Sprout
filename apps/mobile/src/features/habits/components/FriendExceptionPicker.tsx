import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Profile } from "@sprout/shared";
import { colors, spacing } from "@sprout/design-tokens";
import { SearchField } from "../../../components/SearchField";
import { useTheme } from "../../../providers/ThemeProvider";
import { useFriendExceptionPicker } from "../hooks/useFriendExceptionPicker";

interface Props {
  label: string;
  friends: readonly Profile[];
  selected: readonly string[];
  onChange(value: string[]): void;
}

export function FriendExceptionPicker({
  label,
  friends,
  selected,
  onChange,
}: Props): React.JSX.Element {
  const theme = useTheme();
  const picker = useFriendExceptionPicker(friends, selected, onChange);
  return (
    <View style={[styles.root, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.heading}>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        <Text accessibilityLiveRegion="polite" style={[styles.count, { color: theme.muted }]}>
          {selected.length} selected
        </Text>
      </View>
      <SearchField
        accessibilityLabel={`Search friends for ${label.toLocaleLowerCase()}`}
        value={picker.query}
        onChangeText={picker.setQuery}
        placeholder="Search friends by name or username"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      {!picker.query.trim() && friends.length > picker.visibleFriends.length ? (
        <Text style={[styles.quickAddHint, { color: theme.muted }]}>Top 5 quick add friends</Text>
      ) : null}
      {picker.visibleFriends.length ? (
        <View style={styles.results}>
          {picker.visibleFriends.map((friend) => {
            const active = picker.selectedFriendIds.has(friend.id);
            return (
              <Pressable
                key={friend.id}
                accessibilityRole="checkbox"
                accessibilityLabel={`${friend.display_name ?? friend.username}, @${friend.username}`}
                accessibilityState={{ checked: active }}
                onPress={() => picker.toggleFriend(friend.id)}
                style={({ pressed }) => [
                  styles.friend,
                  { borderColor: theme.border },
                  active && styles.friendSelected,
                  pressed && styles.friendPressed,
                ]}
              >
                <View style={styles.friendIdentity}>
                  <Text style={[styles.friendName, { color: active ? colors.paper : theme.text }]}>
                    {friend.display_name || `@${friend.username}`}
                  </Text>
                  {friend.display_name ? (
                    <Text style={[styles.username, { color: active ? "#DCEBDD" : theme.muted }]}>
                      @{friend.username}
                    </Text>
                  ) : null}
                </View>
                <Text style={[styles.check, { color: active ? colors.paper : theme.muted }]}>
                  {active ? "✓" : "+"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Text accessibilityLiveRegion="polite" style={[styles.empty, { color: theme.muted }]}>
          No friends match that search.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { borderWidth: 1, padding: spacing.md, borderRadius: 14, gap: spacing.sm },
  heading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  label: { flex: 1, fontFamily: "Outfit_600SemiBold" },
  count: { fontSize: 12, fontFamily: "Outfit_500Medium" },
  quickAddHint: { fontSize: 12, fontFamily: "Outfit_500Medium" },
  results: { gap: spacing.xs },
  friend: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  friendSelected: { backgroundColor: colors.forest, borderColor: colors.forest },
  friendPressed: { opacity: 0.78 },
  friendIdentity: { flex: 1 },
  friendName: { fontFamily: "Outfit_600SemiBold" },
  username: { fontSize: 12, marginTop: 2 },
  check: { width: 24, textAlign: "center", fontSize: 18, fontFamily: "Outfit_700Bold" },
  empty: { paddingVertical: spacing.sm, textAlign: "center" },
});
