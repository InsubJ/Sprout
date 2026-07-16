import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { useTheme } from "../../../providers/ThemeProvider";

interface Props {
  currentQuestion: number | null;
  totalQuestions: number;
}

export function HabitWorkshopProgress({
  currentQuestion,
  totalQuestions,
}: Props): React.JSX.Element {
  const theme = useTheme();
  const completed = currentQuestion ?? totalQuestions;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: totalQuestions, now: completed }}
    >
      <Text style={[styles.label, { color: theme.muted }]}>
        {currentQuestion ? `Question ${currentQuestion} of ${totalQuestions}` : "Ready to plant"}
      </Text>
      <View style={styles.segments}>
        {Array.from({ length: totalQuestions }, (_, index) => (
          <View
            key={index}
            style={[
              styles.segment,
              { backgroundColor: theme.border },
              index < completed && styles.segmentComplete,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontFamily: "Outfit_600SemiBold", marginBottom: spacing.sm },
  segments: { flexDirection: "row", gap: spacing.xs },
  segment: { flex: 1, height: 5, borderRadius: 999 },
  segmentComplete: { backgroundColor: colors.forest },
});
