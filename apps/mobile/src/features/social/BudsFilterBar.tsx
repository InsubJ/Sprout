import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@sprout/design-tokens";
import { useTheme } from "../../providers/ThemeProvider";

export type BudsFilter = "friends" | "pending" | "incoming" | "add";

const options: ReadonlyArray<{ value: BudsFilter; label: string }> = [
  { value: "friends", label: "Friends" },
  { value: "pending", label: "Pending" },
  { value: "incoming", label: "Incoming" },
  { value: "add", label: "Add" },
];

export function BudsFilterBar({
  value,
  onChange,
}: {
  value: BudsFilter;
  onChange(value: BudsFilter): void;
}): React.JSX.Element {
  const theme = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      style={[styles.root, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(option.value)}
            style={[styles.option, selected && styles.selected]}
          >
            <Text style={[styles.label, { color: selected ? colors.paper : theme.muted }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.xs,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  option: {
    flexGrow: 1,
    minWidth: 72,
    alignItems: "center",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  selected: { backgroundColor: colors.forest },
  label: { fontFamily: "Outfit_600SemiBold" },
});
