import { Modal, StyleSheet, Text, View } from "react-native";
import { spacing } from "@sprout/design-tokens";
import type { PlantGenerationJob } from "@sprout/shared";
import { AppButton } from "../../../components/AppButton";
import { useTheme } from "../../../providers/ThemeProvider";
import { CompletionConfetti } from "../../habits/components/CompletionConfetti";
import { GeneratedPlantRenderer } from "./GeneratedPlantRenderer";

export function CustomPlantCelebrationSheet({
  job,
  onVisitSanctuary,
}: {
  job: PlantGenerationJob | null;
  onVisitSanctuary(): void;
}) {
  const theme = useTheme();
  return (
    <Modal transparent visible={Boolean(job?.generatedSpec)} animationType="fade">
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
          <CompletionConfetti />
          {job?.generatedSpec ? (
            <GeneratedPlantRenderer spec={job.generatedSpec} size={190} state="completed" />
          ) : null}
          <Text style={[styles.title, { color: theme.text }]}>A New Plant Is Born!</Text>
          <Text style={[styles.copy, { color: theme.muted }]}>
            {job?.editedName ?? job?.suggestedName} has been added to your Sanctuary.
          </Text>
          <AppButton label="Visit Sanctuary" onPress={onVisitSanctuary} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(13,23,41,.68)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  sheet: {
    width: "100%",
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
    overflow: "hidden",
  },
  title: { fontSize: 28, fontFamily: "Outfit_700Bold", textAlign: "center" },
  copy: { textAlign: "center" },
});
