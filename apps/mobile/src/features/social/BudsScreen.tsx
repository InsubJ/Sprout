import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { useRouter } from "expo-router";
import { ResponsivePageContent } from "../../components/ResponsivePageContent";
import { useTheme } from "../../providers/ThemeProvider";
import { FriendList } from "./FriendList";
import { FriendRequestSection } from "./FriendRequestSection";
import { FriendSearchSection } from "./FriendSearchSection";
import { useBuds } from "./useBuds";

function showError(cause: unknown): void {
  Alert.alert("Could not complete action", cause instanceof Error ? cause.message : "Try again");
}
export function BudsScreen(): React.JSX.Element {
  const router = useRouter();
  const buds = useBuds();
  const theme = useTheme();
  const [query, setQuery] = useState("");
  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <ResponsivePageContent style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, theme.dark && styles.dark]}>GROW TOGETHER</Text>
          <Text style={[styles.title, { color: theme.text }]}>Buds</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            {buds.isDemo ? "Demo social garden" : `${buds.friends.length} connected gardeners`}
          </Text>
        </View>
        <FriendSearchSection
          query={query}
          results={buds.results}
          onQueryChange={setQuery}
          onSearch={() => void buds.search(query).catch(showError)}
          onAdd={(profile) => void buds.add(profile).catch(showError)}
        />
        <FriendRequestSection
          incoming={buds.incoming}
          outgoing={buds.outgoing}
          onRespond={(friendship, status) => void buds.respond(friendship, status).catch(showError)}
          onCancel={(friendship) => void buds.cancel(friendship).catch(showError)}
          workingRequestId={buds.workingRequestId}
        />
        <FriendList rows={buds.friends} onVisit={(id) => router.push(`/friend-forest/${id}`)} />
        {buds.error ? <Text style={styles.error}>{buds.error}</Text> : null}
      </ResponsivePageContent>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  scrollContent: { alignItems: "center" },
  content: { paddingBottom: spacing.xxl },
  header: { padding: spacing.lg, paddingTop: spacing.xl },
  eyebrow: { color: colors.forest, fontSize: 12, fontFamily: "Outfit_700Bold", letterSpacing: 1.5 },
  dark: { color: "#9BCB8E" },
  title: { fontSize: 32, fontFamily: "Outfit_700Bold" },
  subtitle: { color: colors.muted },
  error: { color: colors.danger, textAlign: "center", padding: spacing.md },
});
