import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Habit } from "@sprout/shared";
import { colors } from "@sprout/design-tokens";
import { useTheme } from "../../../providers/ThemeProvider";
import { StreakIndicator } from "./StreakIndicator";

export function HabitCardFooter({
  habit,
  onNudge,
  isNudged,
  nudgeLoading,
}: {
  habit: Habit;
  onNudge?: () => void;
  isNudged: boolean;
  nudgeLoading: boolean;
}): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={styles.root}>
      <StreakIndicator streak={habit.current_streak} color={theme.text} />
      {habit.status === "withered" && onNudge ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isNudged ? "Nudge already sent today" : "Nudge this plant"}
          disabled={isNudged || nudgeLoading}
          onPress={onNudge}
          style={[styles.nudge, (isNudged || nudgeLoading) && styles.disabled]}
        >
          <Text style={styles.text}>
            {nudgeLoading ? "Nudging…" : isNudged ? "Nudged" : "Nudge"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    marginTop: "auto",
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nudge: {
    backgroundColor: colors.forest,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  disabled: { opacity: 0.55 },
  text: { color: colors.paper, fontFamily: "Outfit_700Bold", fontSize: 12 },
});
