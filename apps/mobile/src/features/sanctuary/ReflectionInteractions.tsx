import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { useTheme } from "../../providers/ThemeProvider";
import { reactionChoices, useReflectionInteractions } from "./useReflectionInteractions";

export function ReflectionInteractions({ logId }: { logId: string }): React.JSX.Element {
  const theme = useTheme();
  const [content, setContent] = useState("");
  const state = useReflectionInteractions(logId);
  if (!state.available)
    return (
      <Text style={[styles.hint, { color: theme.muted }]}>
        Sign in with the full service to share reactions and kind words.
      </Text>
    );
  return (
    <View style={[styles.root, { borderTopColor: theme.border }]}>
      {state.loading ? (
        <Text accessibilityLiveRegion="polite" style={[styles.hint, { color: theme.muted }]}>
          Loading existing reactions and comments…
        </Text>
      ) : null}
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
            { color: theme.text, borderColor: theme.border, backgroundColor: theme.elevated },
          ]}
        />
        <Pressable
          accessibilityRole="button"
          disabled={state.busy || !content.trim()}
          onPress={() =>
            void state.comment(content).then((saved) => {
              if (saved) setContent("");
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
