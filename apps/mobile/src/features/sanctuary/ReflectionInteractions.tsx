import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { LogComment, LogReaction } from "@sprout/shared";
import { colors, spacing } from "@sprout/design-tokens";
import { useAuth } from "../../providers/AuthProvider";
import { useServices } from "../../providers/ServicesProvider";
import { useTheme } from "../../providers/ThemeProvider";

const choices = ["👍", "❤️", "👏", "🌱"] as const;
export function ReflectionInteractions({ logId }: { logId: string }) {
  const { user } = useAuth();
  const { interactions } = useServices();
  const theme = useTheme();
  const [comments, setComments] = useState<LogComment[]>([]);
  const [reactions, setReactions] = useState<LogReaction[]>([]);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!interactions) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      const [nextComments, nextReactions] = await Promise.race([
        Promise.all([interactions.getComments(logId), interactions.getReactions(logId)]),
        new Promise<never>((_resolve, reject) => { timeoutId = setTimeout(() => reject(new Error("Feedback is taking too long to load.")), 8000); }),
      ]);
      setComments(nextComments);
      setReactions(nextReactions);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to load feedback",
      );
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [interactions, logId]);
  useEffect(() => {
    void load();
  }, [load]);
  const counts = useMemo(
    () =>
      Object.fromEntries(
        choices.map((choice) => [
          choice,
          reactions.filter((item) => item.reaction_type === choice).length,
        ]),
      ),
    [reactions],
  );
  if (!interactions || !user)
    return (
      <Text style={[styles.hint, { color: theme.muted }]}>
        Sign in with the full service to share reactions and kind words.
      </Text>
    );
  const toggle = async (reactionType: string) => {
    setBusy(true);
    setError(null);
    try {
      await interactions.toggleReaction({
        log_id: logId,
        user_id: user.id,
        reaction_type: reactionType,
      });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to react");
    } finally {
      setBusy(false);
    }
  };
  const comment = async () => {
    const value = content.trim();
    if (!value) return;
    setBusy(true);
    setError(null);
    try {
      await interactions.createComment({
        log_id: logId,
        user_id: user.id,
        content: value,
      });
      setContent("");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to comment");
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={[styles.root, { borderTopColor: theme.border }]}>
      {loading ? <Text accessibilityLiveRegion="polite" style={[styles.hint, { color: theme.muted }]}>Loading existing reactions and comments…</Text> : null}
      <View style={styles.row}>
        {choices.map((choice) => {
          const active = reactions.some(
            (item) => item.user_id === user.id && item.reaction_type === choice,
          );
          return (
            <Pressable
              key={choice}
              accessibilityRole="button"
              accessibilityLabel={`${choice} reaction, ${counts[choice]} total`}
              accessibilityState={{ selected: active, disabled: busy }}
              disabled={busy}
              onPress={() => void toggle(choice)}
              style={[
                styles.reaction,
                {
                  borderColor: active ? colors.forest : theme.border,
                  backgroundColor: active ? "#DCEBD3" : theme.elevated,
                },
              ]}
            >
              <Text>
                {choice} {counts[choice] || ""}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.heading, { color: theme.text }]}>Comments</Text>
      {comments.length ? (
        comments.map((item) => (
          <View
            key={item.id}
            style={[styles.comment, { backgroundColor: theme.elevated }]}
          >
            <Text style={{ color: theme.text }}>{item.content}</Text>
            <Text style={[styles.date, { color: theme.muted }]}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        ))
      ) : (
        <Text style={[styles.hint, { color: theme.muted }]}>
          No comments yet. Leave a kind word.
        </Text>
      )}
      <View style={styles.form}>
        <TextInput
          accessibilityLabel="Write a comment"
          placeholder="Write a comment…"
          placeholderTextColor={theme.muted}
          value={content}
          maxLength={500}
          onChangeText={setContent}
          style={[
            styles.input,
            {
              color: theme.text,
              borderColor: theme.border,
              backgroundColor: theme.elevated,
            },
          ]}
        />
        <Pressable
          accessibilityRole="button"
          disabled={busy || !content.trim()}
          onPress={() => void comment()}
          style={styles.send}
        >
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
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
  date: { fontSize: 11, marginTop: 3 },
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
