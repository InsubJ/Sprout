import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@sprout/design-tokens";
import { useTheme } from "../providers/ThemeProvider";

export interface DropdownOption<Value extends string> {
  value: Value;
  label: string;
  description?: string;
  accessibilityHint?: string;
}

interface Props<Value extends string> {
  value: Value;
  options: ReadonlyArray<DropdownOption<Value>>;
  label: string;
  onChange(value: Value): void;
}

export function DropdownField<Value extends string>({
  value,
  options,
  label,
  onChange,
}: Props<Value>): React.JSX.Element {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) ?? options[0];

  if (!selected) throw new Error("DropdownField requires at least one option");

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, currently ${selected.label}`}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.control,
          { backgroundColor: theme.surface, borderColor: theme.border },
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.selectedCopy}>
          <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
          <Text style={[styles.value, { color: theme.text }]}>{selected.label}</Text>
          {selected.description ? (
            <Text style={[styles.selectedDescription, { color: theme.muted }]}>
              {selected.description}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.chevron, { color: theme.muted }]}>⌄</Text>
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Close ${label.toLowerCase()} options`}
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
                  accessibilityHint={option.accessibilityHint}
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
                  <View style={styles.optionCopy}>
                    <Text
                      style={[styles.optionText, { color: active ? colors.paper : theme.text }]}
                    >
                      {option.label}
                    </Text>
                    {option.description ? (
                      <Text
                        style={[
                          styles.optionDescription,
                          { color: active ? "#DCEBDD" : theme.muted },
                        ]}
                      >
                        {option.description}
                      </Text>
                    ) : null}
                  </View>
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
    minHeight: 64,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  selectedCopy: { flex: 1 },
  label: { fontSize: 11, fontFamily: "Outfit_500Medium" },
  value: { fontFamily: "Outfit_600SemiBold", marginTop: 2 },
  selectedDescription: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  chevron: { fontSize: 24 },
  pressed: { opacity: 0.75 },
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
    minHeight: 56,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  optionActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  optionCopy: { flex: 1 },
  optionText: { fontFamily: "Outfit_600SemiBold" },
  optionDescription: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  check: { color: colors.paper, fontSize: 18, fontFamily: "Outfit_700Bold" },
});
