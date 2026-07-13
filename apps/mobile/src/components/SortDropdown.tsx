import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@sprout/design-tokens";
import { useTheme } from "../providers/ThemeProvider";
export interface SortOption<Value extends string> {
  value: Value;
  label: string;
}
interface Props<Value extends string> {
  value: Value;
  options: ReadonlyArray<SortOption<Value>>;
  label: string;
  onChange(value: Value): void;
}
export function SortDropdown<Value extends string>({
  value,
  options,
  label,
  onChange,
}: Props<Value>): React.JSX.Element {
  const theme = useTheme(),
    [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) ?? options[0];
  if (!selected) throw new Error("SortDropdown requires at least one option");
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, currently ${selected.label}`}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={[styles.control, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        <View>
          <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
          <Text style={[styles.value, { color: theme.text }]}>{selected.label}</Text>
        </View>
        <Text style={[styles.chevron, { color: theme.muted }]}>⌄</Text>
      </Pressable>
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close sort options"
          style={styles.backdrop}
          onPress={() => setOpen(false)}
        >
          <View
            style={[styles.menu, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Text style={[styles.heading, { color: theme.text }]}>{label}</Text>
            {options.map((option) => {
              const active = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: active }}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  style={[
                    styles.option,
                    { borderColor: theme.border },
                    active && styles.optionActive,
                  ]}
                >
                  <Text style={[styles.optionText, { color: active ? colors.paper : theme.text }]}>
                    {option.label}
                  </Text>
                  {active ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
const styles = StyleSheet.create({
  control: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: { fontSize: 11, fontFamily: "Outfit_500Medium" },
  value: { fontFamily: "Outfit_600SemiBold", marginTop: 2 },
  chevron: { fontSize: 24 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  menu: {
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  heading: { fontSize: 20, fontFamily: "Outfit_700Bold", marginBottom: spacing.xs },
  option: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  optionText: { fontFamily: "Outfit_600SemiBold" },
  check: { color: colors.paper, fontSize: 18, fontFamily: "Outfit_700Bold" },
});
