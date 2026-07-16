import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { useRouter } from "expo-router";
import { Avatar } from "../../components/Avatar";
import { DismissibleTextInput } from "../../components/DismissibleTextInput";
import { useTheme } from "../../providers/ThemeProvider";
import { reactionChoices, useReflectionInteractions } from "./useReflectionInteractions";
import { useReflectionCommentDraft } from "./useReflectionCommentDraft";

export function ReflectionInteractions({ logId }: { logId: string }): React.JSX.Element {
  const theme = useTheme();
  const router = useRouter();
  const state = useReflectionInteractions(logId);
  const draft = useReflectionCommentDraft(state.userId, logId);
  if (!state.available)
    return (
      <Text style={[styles.hint, { color: theme.muted }]}>
        Sign in with the full service to share reactions and kind words.
      </Text>
    );
  return (
    <View style={[styles.root, { borderTopColor: theme.border }]}>
      <View style={styles.row}>
        {reactionChoices.map((choice) => {
          const active = state.reactions.some(
            (item) => item.user_id === state.userId && item.reaction_type === choice,
          );
          return (
            <Pressable
              key={choice}
              accessibilityRole="button"
              accessibilityLabel={`${choice} reaction, ${state.counts[choice]} total`}
              accessibilityState={{ selected: active, disabled: state.busy }}
              disabled={state.busy}
              onPress={() => void state.toggle(choice)}
              style={[
                styles.reaction,
                {
                  borderColor: active ? colors.forest : theme.border,
                  backgroundColor: active ? "#DCEBD3" : theme.elevated,
                },
              ]}
            >
              <Text>
                {choice} {state.counts[choice] || ""}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.heading, { color: theme.text }]}>Comments</Text>
      {state.comments.length ? (
        state.comments.map((item) => (
          <View key={item.id} style={[styles.comment, { backgroundColor: theme.elevated }]}>
            <View style={styles.commentHeader}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Visit ${state.commentAuthors[item.user_id]?.username ?? "gardener"}'s garden`}
                onPress={() =>
                  router.push(
                    item.user_id === state.userId
                      ? "/(tabs)/forest"
                      : `/friend-forest/${item.user_id}`,
                  )
                }
                style={({ pressed }) => [styles.author, pressed && styles.authorPressed]}
              >
                <Avatar
                  uri={state.commentAuthors[item.user_id]?.avatar_url}
                  label={state.commentAuthors[item.user_id]?.username ?? "Gardener"}
                  size={24}
                />
                <Text style={[styles.username, { color: theme.text }]}>
                  @{state.commentAuthors[item.user_id]?.username ?? "gardener"}
                </Text>
              </Pressable>
              <Text style={[styles.date, { color: theme.muted }]}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Text style={{ color: theme.text }}>{item.content}</Text>
          </View>
        ))
      ) : state.loading ? null : (
        <Text style={[styles.hint, { color: theme.muted }]}>
          No comments yet. Leave a kind word.
        </Text>
      )}
      <View style={styles.form}>
        <DismissibleTextInput
          accessibilityLabel="Write a comment"
          placeholder="Write a comment…"
          placeholderTextColor={theme.muted}
          value={draft.content}
          maxLength={500}
          onChangeText={draft.setContent}
          style={[
            styles.input,
            { color: theme.text, borderColor: theme.border, backgroundColor: theme.elevated },
          ]}
        />
        <Pressable
          accessibilityRole="button"
          disabled={state.busy || !draft.content.trim()}
          onPress={() =>
            void state.comment(draft.content).then((saved) => {
              if (saved) draft.clear();
            })
          }
          style={styles.send}
        >
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
      {state.error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {state.error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { borderTopWidth: 1, paddingTop: spacing.md, gap: spacing.sm },
  row: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  reaction: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 48,
    alignItems: "center",
  },
  heading: { fontWeight: "800", marginTop: spacing.xs },
  comment: { borderRadius: 10, padding: spacing.sm },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  author: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  authorPressed: { opacity: 0.6 },
  username: { fontSize: 12, fontFamily: "Outfit_700Bold" },
  date: { fontSize: 11 },
  hint: { fontSize: 12 },
  form: { flexDirection: "row", gap: spacing.sm },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    minHeight: 44,
  },
  send: {
    backgroundColor: colors.forest,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },
  sendText: { color: colors.paper, fontWeight: "800" },
  error: { color: colors.danger, fontSize: 12 },
});
