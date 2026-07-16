import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import type { PlantGenerationJob } from "@sprout/shared";
import { AppButton } from "../../../components/AppButton";
import { DismissibleTextInput } from "../../../components/DismissibleTextInput";
import { ModalSheet } from "../../../components/ModalSheet";
import { useTheme } from "../../../providers/ThemeProvider";
import { GeneratedPlantRenderer } from "./GeneratedPlantRenderer";
export function GeneratedPlantPreview({
  visible,
  job,
  name,
  busy,
  error,
  onNameChange,
  onSave,
  onClose,
}: {
  visible: boolean;
  job: PlantGenerationJob;
  name: string;
  busy: boolean;
  error: string | null;
  onNameChange(value: string): void;
  onSave(): void;
  onClose(): void;
}) {
  const theme = useTheme();
  if (!job.generatedSpec) return null;
  return (
    <ModalSheet visible={visible} onClose={onClose}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        showsVerticalScrollIndicator
      >
        <Text style={[styles.eyebrow, theme.dark && styles.eyebrowDark]}>CUSTOM PLANT PREVIEW</Text>
        <View
          style={[styles.scene, { backgroundColor: theme.elevated, borderColor: theme.border }]}
        >
          <GeneratedPlantRenderer spec={job.generatedSpec} size={260} state="completed" />
        </View>
        <Text style={[styles.label, { color: theme.text }]}>Plant name</Text>
        <DismissibleTextInput
          value={name}
          maxLength={60}
          onChangeText={onNameChange}
          style={[
            styles.input,
            { color: theme.text, backgroundColor: theme.elevated, borderColor: theme.border },
          ]}
          accessibilityLabel="Custom plant name"
        />
        <Text style={[styles.description, { color: theme.text }]}>
          {job.generatedSpec.description}
        </Text>
        <Text style={[styles.meta, { color: theme.muted }]}>Inspired by: {job.originalPrompt}</Text>
      </ScrollView>
      {error ? <Text style={[styles.error, theme.dark && styles.errorDark]}>{error}</Text> : null}
      <View style={styles.actions}>
        <AppButton
          tone="disco"
          label={busy ? "Saving…" : "Save to Sanctuary"}
          disabled={busy || !name.trim()}
          onPress={onSave}
        />
        <AppButton tone="quiet" label="Keep editing later" disabled={busy} onPress={onClose} />
      </View>
    </ModalSheet>
  );
}
const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.md },
  eyebrow: { color: colors.purple, fontFamily: "Outfit_700Bold", letterSpacing: 1.4 },
  eyebrowDark: { color: "#D7B4F0" },
  scene: {
    alignItems: "center",
    marginVertical: spacing.md,
    borderWidth: 1,
    borderRadius: 16,
  },
  label: { color: colors.ink, fontFamily: "Outfit_700Bold", marginBottom: spacing.xs },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#B49AC8",
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    color: colors.ink,
    backgroundColor: colors.paper,
    fontSize: 18,
  },
  description: { color: colors.ink, lineHeight: 21, marginTop: spacing.md },
  meta: { color: colors.muted, fontStyle: "italic", marginVertical: spacing.md },
  error: { color: colors.danger, marginBottom: spacing.md },
  errorDark: { color: "#FFB4A8" },
  actions: { gap: spacing.md, paddingTop: spacing.md },
});
