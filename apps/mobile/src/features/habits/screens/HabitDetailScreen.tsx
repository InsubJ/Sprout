import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import type { PlantSpecies } from "@sprout/shared";
import { spacing } from "@sprout/design-tokens";
import { ProgressBar } from "../../../components/ProgressBar";
import { ScreenState } from "../../../components/ScreenState";
import { useTheme } from "../../../providers/ThemeProvider";
import { nativePlantRegistry } from "../../plants/plantRegistry";
import { useHabitDetail } from "../hooks/useHabitDetail";

export function HabitDetailScreen({ id }: { id?: string }): React.JSX.Element {
  const theme = useTheme();
  const { habit } = useHabitDetail(id);
  if (habit === undefined) return <ScreenState message="Finding this plant…" />;
  if (!habit) return <ScreenState message="This plant is unavailable or private." error />;
  const Plant = nativePlantRegistry[habit.plant_type as PlantSpecies] ?? nativePlantRegistry.bonsai;
  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: true, title: habit.name }} />
      <View style={styles.visual}>
        <Plant
          currentWaterings={habit.current_waterings}
          targetWaterings={habit.target_waterings}
          witherCount={habit.wither_count}
          status={habit.status}
          size={230}
        />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{habit.name}</Text>
      <Text style={[styles.copy, { color: theme.muted }]}>
        {habit.description || "A habit growing one act at a time."}
      </Text>
      <ProgressBar progress={habit.current_waterings / habit.target_waterings} />
      <Text style={[styles.copy, { color: theme.muted }]}>
        {habit.current_waterings} of {habit.target_waterings} waterings
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: spacing.xl, gap: spacing.md },
  visual: { alignItems: "center" },
  title: { fontSize: 30, fontWeight: "900" },
  copy: { lineHeight: 22 },
});
