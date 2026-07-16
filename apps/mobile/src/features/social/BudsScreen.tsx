import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { useRouter } from "expo-router";
import { ResponsivePageContent } from "../../components/ResponsivePageContent";
import { SearchField } from "../../components/SearchField";
import { useTheme } from "../../providers/ThemeProvider";
import { BudsFilterBar, type BudsFilter } from "./BudsFilterBar";
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
  const [filter, setFilter] = useState<BudsFilter>("friends");
  const [friendQuery, setFriendQuery] = useState("");
  const [addQuery, setAddQuery] = useState("");
  const visibleFriends = useMemo(() => {
    const needle = friendQuery.trim().toLowerCase();
    if (!needle) return buds.friends;
    return buds.friends.filter(({ profile }) =>
      `${profile.display_name ?? ""} ${profile.username}`.toLowerCase().includes(needle),
    );
  }, [buds.friends, friendQuery]);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <ResponsivePageContent style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, theme.dark && styles.dark]}>GROW TOGETHER</Text>
          <Text style={[styles.title, { color: theme.text }]}>Buds</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            {buds.isDemo ? "Demo social garden" : `${buds.friends.length} connected gardeners`}
          </Text>
        </View>
        <BudsFilterBar value={filter} onChange={setFilter} />

        {filter === "friends" ? (
          <>
            <View style={styles.search}>
              <SearchField
                value={friendQuery}
                onChangeText={setFriendQuery}
                placeholder="Search current friends"
              />
            </View>
            <FriendList
              rows={visibleFriends}
              onVisit={(id) => router.push(`/friend-forest/${id}`)}
            />
          </>
        ) : null}

        {filter === "pending" ? (
          <FriendRequestSection
            mode="outgoing"
            rows={buds.outgoing}
            onRespond={(friendship, status) =>
              void buds.respond(friendship, status).catch(showError)
            }
            onCancel={(friendship) => void buds.cancel(friendship).catch(showError)}
            workingRequestId={buds.workingRequestId}
          />
        ) : null}

        {filter === "incoming" ? (
          <FriendRequestSection
            mode="incoming"
            rows={buds.incoming}
            onRespond={(friendship, status) =>
              void buds.respond(friendship, status).catch(showError)
            }
            onCancel={(friendship) => void buds.cancel(friendship).catch(showError)}
            workingRequestId={buds.workingRequestId}
          />
        ) : null}

        {filter === "add" ? (
          <FriendSearchSection
            query={addQuery}
            results={buds.results}
            onQueryChange={setAddQuery}
            onSearch={() => void buds.search(addQuery).catch(showError)}
            onAdd={(profile) => void buds.add(profile).catch(showError)}
          />
        ) : null}

        {buds.error ? <Text style={styles.error}>{buds.error}</Text> : null}
      </ResponsivePageContent>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  scrollContent: { alignItems: "center" },
  content: { paddingBottom: spacing.xxl, gap: spacing.md },
  header: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.sm },
  eyebrow: { color: colors.forest, fontSize: 12, fontFamily: "Outfit_700Bold", letterSpacing: 1.5 },
  dark: { color: "#9BCB8E" },
  title: { fontSize: 32, fontFamily: "Outfit_700Bold" },
  subtitle: { color: colors.muted },
  search: { paddingHorizontal: spacing.lg },
  error: { color: colors.danger, textAlign: "center", padding: spacing.md },
});
