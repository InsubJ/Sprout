import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@sprout/design-tokens";
import { useTheme } from "../../../providers/ThemeProvider";
import type { HabitWorkshopStep } from "../hooks/useHabitWorkshop";

interface ReviewItem {
  step: Exclude<HabitWorkshopStep, "review">;
  label: string;
  value: string;
}

interface Props {
  items: readonly ReviewItem[];
  onEdit(step: Exclude<HabitWorkshopStep, "review">): void;
}

export function HabitWorkshopReview({ items, onEdit }: Props): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={styles.root}>
      <View style={styles.heading}>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>
          Here is your habit plan
        </Text>
        <Text style={[styles.helper, { color: theme.muted }]}>
          Read it through and adjust anything that does not feel realistic yet.
        </Text>
      </View>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {items.map((item, index) => (
          <View
            key={item.step}
            style={[
              styles.row,
              index < items.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: 1 },
            ]}
          >
            <View style={styles.copy}>
              <Text style={[styles.label, { color: theme.muted }]}>{item.label}</Text>
              <Text style={[styles.value, { color: theme.text }]}>{item.value}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Change ${item.label.toLowerCase()}`}
              onPress={() => onEdit(item.step)}
              style={({ pressed }) => [styles.edit, pressed && styles.pressed]}
            >
              <Text style={styles.editLabel}>Change</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  heading: { gap: spacing.sm },
  title: { fontSize: 28, lineHeight: 35, fontFamily: "Outfit_700Bold" },
  helper: { fontSize: 15, lineHeight: 22, fontFamily: "Outfit_400Regular" },
  card: { borderWidth: 1, borderRadius: radii.lg, paddingHorizontal: spacing.md },
  row: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  copy: { flex: 1, gap: spacing.xs },
  label: { fontSize: 12, fontFamily: "Outfit_600SemiBold", textTransform: "uppercase" },
  value: { fontSize: 15, lineHeight: 21, fontFamily: "Outfit_500Medium" },
  edit: { borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  editLabel: { color: colors.forest, fontSize: 13, fontFamily: "Outfit_700Bold" },
  pressed: { opacity: 0.6 },
});
