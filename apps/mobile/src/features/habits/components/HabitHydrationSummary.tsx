import { StyleSheet, Text, View } from "react-native";
import { getHabitProgress, type Habit } from "@sprout/shared";
import { useTheme } from "../../../providers/ThemeProvider";
import { ProgressBar } from "../../../components/ProgressBar";

export function HabitHydrationSummary({ habit }: { habit: Habit }): React.JSX.Element {
  const theme = useTheme();
  const progress = getHabitProgress(habit.current_waterings, habit.target_waterings);
  const hydrated = Math.max(0, habit.wither_threshold - habit.consecutive_misses);
  return (
    <>
      {habit.status !== "completed" ? (
        <View accessibilityLabel={`${hydrated} of ${habit.wither_threshold} hydration points`}>
          <Text style={[styles.label, { color: theme.muted }]}>Hydration</Text>
          <View style={styles.dots}>
            {Array.from({ length: habit.wither_threshold }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  { backgroundColor: index < hydrated ? "#4A90E2" : theme.border },
                ]}
              />
            ))}
          </View>
        </View>
      ) : null}
      <View>
        <View style={styles.header}>
          <Text style={[styles.label, { color: theme.text }]}>Growth Progress</Text>
          <Text style={{ color: theme.muted }}>
            {progress.current} / {progress.target} ({progress.percent}%)
          </Text>
        </View>
        <ProgressBar progress={progress.percent / 100} trackColor={theme.border} />
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  label: { fontSize: 12, fontFamily: "Outfit_700Bold", marginBottom: 6 },
  dots: { flexDirection: "row", gap: 6 },
  dot: { flex: 1, height: 7, borderRadius: 999 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
