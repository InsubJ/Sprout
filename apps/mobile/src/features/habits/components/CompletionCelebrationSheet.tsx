import { Modal, StyleSheet, Text, View } from "react-native";
import type { Habit, PlantSpecies } from "@sprout/shared";
import { spacing } from "@sprout/design-tokens";
import { AppButton } from "../../../components/AppButton";
import { SafeAreaModalView } from "../../../components/SafeAreaModalView";
import { useTheme } from "../../../providers/ThemeProvider";
import { nativePlantRegistry, plantDisplayName } from "../../plants/plantRegistry";
import { CompletionConfetti } from "./CompletionConfetti";

export function CompletionCelebrationSheet({
  habit,
  onVisitSanctuary,
}: {
  habit: Habit | null;
  onVisitSanctuary: () => void;
}): React.JSX.Element {
  const theme = useTheme();
  const Plant = habit
    ? (nativePlantRegistry[habit.plant_type as PlantSpecies] ?? nativePlantRegistry.bonsai)
    : null;
  return (
    <Modal transparent visible={Boolean(habit)} animationType="fade">
      <SafeAreaModalView style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
          <CompletionConfetti />
          <Text style={styles.trophy}>🏆</Text>
          {habit && Plant ? (
            <Plant
              currentWaterings={habit.target_waterings}
              targetWaterings={habit.target_waterings}
              witherCount={habit.wither_count}
              status="completed"
              size={150}
            />
          ) : null}
          <Text style={[styles.title, { color: theme.text }]}>Fully Grown!</Text>
          {habit ? (
            <Text style={[styles.copy, { color: theme.muted }]}>
              {habit.name} · {plantDisplayName(habit.plant_type as PlantSpecies)}
            </Text>
          ) : null}
          <Text style={[styles.copy, { color: theme.muted }]}>
            {habit?.name} has moved to your Sanctuary.
          </Text>
          {habit?.poetic_summary ? (
            <Text style={[styles.copy, { color: theme.muted }]}>{habit.poetic_summary}</Text>
          ) : null}
          <AppButton label="Visit Sanctuary" onPress={onVisitSanctuary} />
        </View>
      </SafeAreaModalView>
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
  },
  trophy: { fontSize: 42 },
  title: { fontSize: 28, fontFamily: "Outfit_700Bold" },
  copy: { textAlign: "center" },
});
