import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { Avatar } from "../../components/Avatar";
import { ResponsivePageContent } from "../../components/ResponsivePageContent";
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
      <ResponsivePageContent style={styles.content}>
        <Avatar uri={profile.avatar_url} label={profile.username} size={96} />
        <Text style={styles.title}>{profile.display_name || profile.username}</Text>
        <Text style={styles.copy}>@{profile.username}</Text>
      </ResponsivePageContent>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.sand,
  },
  content: {
    flex: 1,
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: { color: colors.ink, fontSize: 28, fontWeight: "900" },
  copy: { color: colors.muted },
});
