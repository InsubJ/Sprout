import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { Avatar } from "../../components/Avatar";
import { ScreenState } from "../../components/ScreenState";
import { useProfileDetail } from "./useProfileDetail";

export function ProfileDetailScreen({ id }: { id?: string }): React.JSX.Element {
  const profile = useProfileDetail(id);
  if (profile === undefined) return <ScreenState message="Finding this gardener…" />;
  if (!profile) return <ScreenState message="This profile is unavailable." error />;
  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{ headerShown: true, title: profile.display_name || profile.username }}
      />
      <Avatar uri={profile.avatar_url} label={profile.username} size={96} />
      <Text style={styles.title}>{profile.display_name || profile.username}</Text>
      <Text style={styles.copy}>@{profile.username}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.sand,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: { color: colors.ink, fontSize: 28, fontWeight: "900" },
  copy: { color: colors.muted },
});
