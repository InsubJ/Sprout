import { StyleSheet, Text, View } from "react-native";
import type { Habit } from "@sprout/shared";
import { useTheme } from "../../../providers/ThemeProvider";

const frequencyLabels = {
  twice_daily: "Twice Daily",
  daily: "Daily",
  weekly: "Weekly",
  fortnightly: "Fortnightly",
  monthly: "Monthly",
  yearly: "Yearly",
  flexible: "Flexible",
} as const;
const tierColors = {
  common: "#556B2F",
  uncommon: "#A0522D",
  rare: "#C71585",
  mythical: "#8B6508",
} as const;
const darkTierColors = {
  common: "#B5D477",
  uncommon: "#E7A67F",
  rare: "#FF91C8",
  mythical: "#FFD866",
} as const;

export function HabitCardHeader({
  habit,
  name,
}: {
  habit: Habit;
  name: string;
}): React.JSX.Element {
  const theme = useTheme();
  const statusColor =
    habit.status === "withered"
      ? theme.dark
        ? "#F2A594"
        : "#9B392B"
      : habit.status === "completed"
        ? theme.dark
          ? "#F6C0B5"
          : "#8B3F35"
        : theme.dark
          ? "#A9D89B"
          : "#1F6B2B";
  return (
    <View style={styles.root}>
      <View style={styles.heading}>
        <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
        <View style={styles.meta}>
          <Text
            style={[
              styles.frequency,
              {
                color: theme.dark ? "#A9D89B" : "#2D5A27",
                backgroundColor: theme.dark ? "#203B2A" : "#DCEBD3",
              },
            ]}
          >
            {frequencyLabels[habit.frequency]}
          </Text>
          <Text
            style={[
              styles.tier,
              { color: (theme.dark ? darkTierColors : tierColors)[habit.difficulty_tier] },
            ]}
          >
            {habit.difficulty_tier}
          </Text>
        </View>
      </View>
      <Text style={[styles.status, { color: statusColor, borderColor: statusColor }]}>
        {habit.status}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  heading: { flex: 1 },
  name: { fontFamily: "Outfit_700Bold", fontSize: 20, lineHeight: 24 },
  meta: { flexDirection: "row", gap: 8, marginTop: 6 },
  frequency: {
    fontSize: 11,
    fontFamily: "Outfit_700Bold",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
  },
  tier: {
    fontSize: 12,
    fontFamily: "Outfit_700Bold",
    textTransform: "capitalize",
    paddingVertical: 3,
  },
  status: {
    textTransform: "capitalize",
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
});
