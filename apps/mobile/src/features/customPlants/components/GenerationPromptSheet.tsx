import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { AppButton } from "../../../components/AppButton";
import { ModalSheet } from "../../../components/ModalSheet";
import { useTheme } from "../../../providers/ThemeProvider";
export function GenerationPromptSheet({
  visible,
  prompt,
  busy,
  error,
  onChange,
  onGenerate,
  onClose,
}: {
  visible: boolean;
  prompt: string;
  busy: boolean;
  error: string | null;
  onChange(value: string): void;
  onGenerate(): void;
  onClose(): void;
}) {
  const theme = useTheme();
  const valid = prompt.trim().length >= 3 && prompt.trim().length <= 1000;
  return (
    <ModalSheet visible={visible} onClose={onClose}>
      <Text style={styles.eyebrow}>PLANT GOD</Text>
      <Text style={[styles.title, { color: theme.text }]}>Imagine your plant</Text>
      <Text style={[styles.copy, { color: theme.muted }]}>
        Describe colours, mood, botanical shapes, or a gentle fantasy. Sprout will generate safe
        plant data using its existing native geometry.
      </Text>
      <TextInput
        multiline
        maxLength={1000}
        value={prompt}
        onChangeText={onChange}
        placeholder="A moonlit tea blossom with silver leaves…"
        placeholderTextColor={theme.muted}
        style={[
          styles.input,
          { color: theme.text, backgroundColor: theme.elevated, borderColor: theme.border },
        ]}
        accessibilityLabel="Custom plant description"
      />
      <Text style={[styles.count, { color: theme.muted }]}>{prompt.length}/1000</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <AppButton
          tone="disco"
          label={busy ? "Generating…" : "Generate Plant"}
          disabled={!valid || busy}
          onPress={onGenerate}
        />
        <AppButton tone="quiet" label="Not now" disabled={busy} onPress={onClose} />
      </View>
    </ModalSheet>
  );
}
const styles = StyleSheet.create({
  eyebrow: { color: colors.purple, fontFamily: "Outfit_700Bold", letterSpacing: 1.5 },
  title: { color: colors.ink, fontFamily: "Outfit_700Bold", fontSize: 30, marginTop: spacing.sm },
  copy: { color: colors.muted, lineHeight: 21, marginVertical: spacing.lg },
  input: {
    minHeight: 160,
    borderWidth: 1,
    borderColor: "#B49AC8",
    borderRadius: 16,
    padding: spacing.md,
    color: colors.ink,
    textAlignVertical: "top",
    backgroundColor: colors.paper,
  },
  count: { textAlign: "right", color: colors.muted, marginVertical: spacing.sm },
  error: { color: colors.danger, marginBottom: spacing.md },
  actions: { gap: spacing.md, marginTop: spacing.sm },
});
