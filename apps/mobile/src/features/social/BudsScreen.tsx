import { useCallback, useEffect, useState } from "react";
import type * as React from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Friendship, Profile } from "@sprout/shared";
import { colors, radii, spacing } from "@sprout/design-tokens";
import { AppButton } from "../../components/AppButton";
import { TextField } from "../../components/TextField";
import { useAuth } from "../../providers/AuthProvider";
import { useServices } from "../../providers/ServicesProvider";
import { useTheme } from "../../providers/ThemeProvider";
import { useRouter } from "expo-router";
interface FriendRow {
  friendship: Friendship;
  profile: Profile;
}
interface RequestRow {
  friendship: Friendship;
  profile: Profile;
}
const demoProfile: Profile = {
  id: "33333333-3333-3333-3333-333333333333",
  username: "willow",
  display_name: "Willow",
  avatar_url: null,
  created_at: new Date().toISOString(),
};
export function BudsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profiles, social, isDemo } = useServices();
  const theme = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [rows, setRows] = useState<FriendRow[]>([]);
  const [incoming, setIncoming] = useState<RequestRow[]>([]);
  const [outgoing, setOutgoing] = useState<RequestRow[]>([]);
  const load = useCallback(async () => {
    if (!user) return;
    if (!social || !profiles) {
      setRows([
        {
          friendship: {
            id: "demo-friendship",
            user_id: user.id,
            friend_id: demoProfile.id,
            status: "accepted",
            created_at: new Date().toISOString(),
          },
          profile: demoProfile,
        },
      ]);
      return;
    }
    const all = await social.getFriendships(user.id);
    const incomingPending = all.filter(
      (item) => item.friend_id === user.id && item.status === "pending",
    );
    const outgoingPending = all.filter(
      (item) => item.user_id === user.id && item.status === "pending",
    );
    const [resolvedIncoming, resolvedOutgoing] = await Promise.all([
      Promise.all(
        incomingPending.map(async (friendship) => {
          const profile = await profiles.getById(friendship.user_id);
          return profile ? { friendship, profile } : null;
        }),
      ),
      Promise.all(
        outgoingPending.map(async (friendship) => {
          const profile = await profiles.getById(friendship.friend_id);
          return profile ? { friendship, profile } : null;
        }),
      ),
    ]);
    setIncoming(
      resolvedIncoming.filter((row): row is RequestRow => Boolean(row)),
    );
    setOutgoing(
      resolvedOutgoing.filter((row): row is RequestRow => Boolean(row)),
    );
    const accepted = all.filter((item) => item.status === "accepted");
    const resolved = await Promise.all(
      accepted.map(async (friendship) => {
        const friendId =
          friendship.user_id === user.id
            ? friendship.friend_id
            : friendship.user_id;
        const profile = await profiles.getById(friendId);
        if (!profile) return null;
        return { friendship, profile };
      }),
    );
    setRows(resolved.filter((row): row is FriendRow => Boolean(row)));
  }, [profiles, social, user]);
  useEffect(() => {
    void load();
  }, [load]);
  const search = async () => {
    if (!user || !profiles) {
      setResults([demoProfile]);
      return;
    }
    setResults(await profiles.search(query, user.id));
  };
  const add = async (profile: Profile) => {
    if (!user || !social) {
      Alert.alert(
        "Demo request sent",
        `@${profile.username} will see your request.`,
      );
      return;
    }
    await social.sendFriendRequest(user.id, profile.id);
    setResults((current) => current.filter((item) => item.id !== profile.id));
    await load();
  };
  const respond = async (
    friendship: Friendship,
    status: "accepted" | "declined",
  ) => {
    if (!social) {
      setIncoming((current) =>
        current.filter((item) => item.friendship.id !== friendship.id),
      );
      return;
    }
    await social.respond(friendship.id, status);
    await load();
  };
  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.eyebrow, theme.dark && styles.eyebrowDark]}>
          GROW TOGETHER
        </Text>
        <Text style={[styles.title, { color: theme.text }]}>Buds</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          {isDemo ? "Demo social garden" : `${rows.length} connected gardeners`}
        </Text>
      </View>
      <View style={styles.search}>
        <TextField
          label="Find by username"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={() => void search()}
        />
        <AppButton label="Search gardeners" onPress={() => void search()} />
      </View>
      {results.map((item) => (
        <PersonRow
          key={item.id}
          profile={item}
          action={
            <AppButton
              label="Add bud"
              tone="quiet"
              onPress={() => void add(item).catch(showError)}
            />
          }
        />
      ))}
      <Text style={[styles.section, { color: theme.text }]}>
        Friend requests
      </Text>
      <Text style={[styles.requestHeading, { color: theme.text }]}>
        Incoming
      </Text>
      {incoming.length ? (
        incoming.map((row) => (
          <View
            key={row.friendship.id}
            style={[
              styles.requestCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <RequestIdentity profile={row.profile} />
            <View style={styles.requestActions}>
              <AppButton
                label="Accept"
                tone="quiet"
                onPress={() =>
                  void respond(row.friendship, "accepted").catch(showError)
                }
              />
              <AppButton
                label="Decline"
                tone="quiet"
                onPress={() =>
                  void respond(row.friendship, "declined").catch(showError)
                }
              />
            </View>
          </View>
        ))
      ) : (
        <Text style={[styles.requestEmpty, { color: theme.muted }]}>
          No incoming requests.
        </Text>
      )}
      <Text style={[styles.requestHeading, { color: theme.text }]}>
        Outgoing
      </Text>
      {outgoing.length ? (
        outgoing.map((row) => (
          <View
            key={row.friendship.id}
            style={[
              styles.requestCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <RequestIdentity profile={row.profile} />
            <Text style={[styles.awaiting, { color: theme.muted }]}>
              Awaiting response
            </Text>
          </View>
        ))
      ) : (
        <Text style={[styles.requestEmpty, { color: theme.muted }]}>
          No outgoing requests.
        </Text>
      )}
      <Text style={[styles.section, { color: theme.text }]}>
        Connected forests
      </Text>
      {rows.length === 0 ? (
        <Text style={styles.empty}>
          Your connected gardeners will appear here.
        </Text>
      ) : (
        rows.map((row) => (
          <View
            key={row.friendship.id}
            style={[styles.friendCard, { backgroundColor: theme.surface }]}
          >
            <PersonRow profile={row.profile} />
            <View style={styles.visit}>
              <AppButton
                label="Visit garden"
                tone="quiet"
                onPress={() => router.push(`/friend-forest/${row.profile.id}`)}
              />
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
function RequestIdentity({ profile }: { profile: Profile }) {
  const theme = useTheme();
  return (
    <View style={styles.requestIdentity}>
      <View style={styles.avatar}>
        <Text>🌿</Text>
      </View>
      <View style={styles.personText}>
        <Text style={[styles.name, { color: theme.text }]}>
          {profile.display_name || profile.username}
        </Text>
        <Text style={[styles.username, { color: theme.muted }]}>
          @{profile.username}
        </Text>
      </View>
    </View>
  );
}
function PersonRow({
  profile,
  action,
}: {
  profile: Profile;
  action?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.person, { backgroundColor: theme.surface }]}>
      <View style={styles.avatar}>
        <Text>🌿</Text>
      </View>
      <View style={styles.personText}>
        <Text style={[styles.name, { color: theme.text }]}>
          {profile.display_name || profile.username}
        </Text>
        <Text style={styles.username}>@{profile.username}</Text>
      </View>
      {action}
    </View>
  );
}
function showError(cause: unknown) {
  Alert.alert(
    "Could not complete action",
    cause instanceof Error ? cause.message : "Try again",
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  content: { paddingBottom: spacing.xxl },
  header: { padding: spacing.lg, paddingTop: spacing.xl },
  eyebrow: {
    color: colors.forest,
    fontSize: 12,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 1.5,
  },
  eyebrowDark: { color: "#9BCB8E" },
  title: { color: colors.ink, fontSize: 32, fontFamily: "Outfit_700Bold" },
  subtitle: { color: colors.muted },
  search: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  section: {
    color: colors.ink,
    fontFamily: "Outfit_700Bold",
    fontSize: 20,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  empty: { color: colors.muted, textAlign: "center", padding: spacing.xl },
  friendCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  person: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.paper,
    gap: spacing.sm,
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
  personText: { flex: 1 },
  name: { color: colors.ink, fontFamily: "Outfit_700Bold" },
  username: { color: colors.muted, fontSize: 12 },
  visit: { padding: spacing.md, paddingTop: 0 },
  requestHeading: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    fontFamily: "Outfit_700Bold",
    fontSize: 15,
  },
  requestEmpty: { marginHorizontal: spacing.lg, paddingVertical: spacing.sm },
  requestCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  requestIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  requestActions: { flexDirection: "row", gap: spacing.sm },
  awaiting: { fontSize: 12, fontFamily: "Outfit_500Medium" },
});
