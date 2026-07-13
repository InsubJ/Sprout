import { StyleSheet, Text, View } from "react-native";
import type { Habit } from "@sprout/shared";
import { spacing } from "@sprout/design-tokens";
import { useTheme } from "../../../providers/ThemeProvider";

export function ForestStats({
  habits,
  compact,
}: {
  habits: Habit[];
  compact: boolean;
}): React.JSX.Element {
  const theme = useTheme();
  const values = [
    { label: "Total Trees", value: habits.length, color: theme.text },
    {
      label: "Healthy",
      value: habits.filter((item) => item.status === "healthy").length,
      color: theme.dark ? "#9BCB8E" : "#2D5A27",
    },
    {
      label: "Withered",
      value: habits.filter((item) => item.status === "withered").length,
      color: theme.dark ? "#F2A594" : "#C26555",
    },
    {
      label: "Fully Grown",
      value: habits.filter((item) => item.status === "completed").length,
      color: theme.dark ? "#F6C0B5" : "#EAA89B",
    },
  ];
  return (
    <View style={[styles.root, compact && styles.compact, { backgroundColor: theme.surface }]}>
      {values.map((item) => (
        <View key={item.label} style={styles.stat}>
          <Text style={[styles.value, { color: item.color }]}>{item.value}</Text>
          <Text style={[styles.label, { color: theme.muted }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    flexWrap: "wrap",
    margin: spacing.lg,
    borderRadius: 18,
    padding: spacing.md,
  },
  compact: { rowGap: spacing.md },
  stat: { flexGrow: 1, flexBasis: 72, alignItems: "center" },
  value: { fontSize: 22, fontFamily: "Outfit_700Bold" },
  label: { fontSize: 11 },
});
