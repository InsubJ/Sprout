import { Pressable, StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import type { HabitStatus } from "@sprout/shared";
import { colors, radii, spacing } from "@sprout/design-tokens";
import { AppButton } from "../../components/AppButton";
import { PreferenceSwitchRow } from "../../components/PreferenceSwitchRow";
import { useTheme } from "../../providers/ThemeProvider";

export function LabSimulationControls({
  growth,
  witherCount,
  status,
  revealAll,
  onGrowthChange,
  onWitherCountChange,
  onStatusChange,
  onRevealAllChange,
}: {
  growth: number;
  witherCount: number;
  status: HabitStatus;
  revealAll: boolean;
  onGrowthChange: (value: number) => void;
  onWitherCountChange: (value: number) => void;
  onStatusChange: (value: HabitStatus) => void;
  onRevealAllChange: (value: boolean) => void;
}): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>Simulation Controls</Text>
      <Text style={{ color: theme.text }}>Growth Progress: {growth}%</Text>
      <Slider
        accessibilityLabel="Growth Progress"
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={growth}
        onValueChange={onGrowthChange}
        minimumTrackTintColor={colors.forest}
        maximumTrackTintColor={theme.muted}
      />
      <Text style={{ color: theme.text }}>Plant Status</Text>
      <View style={styles.row}>
        {(["healthy", "withered", "completed"] as const).map((value) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: status === value }}
            onPress={() => onStatusChange(value)}
            style={[styles.chip, status === value && styles.active]}
          >
            <Text style={[styles.chipText, status === value && styles.activeText]}>{value}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.stepper}>
        <Text style={{ color: theme.text }}>Setbacks: {witherCount}</Text>
        <View style={styles.row}>
          <AppButton
            label="−"
            tone="quiet"
            onPress={() => onWitherCountChange(Math.max(0, witherCount - 1))}
          />
          <AppButton label="+" tone="quiet" onPress={() => onWitherCountChange(witherCount + 1)} />
        </View>
      </View>
      <PreferenceSwitchRow
        label="Reveal all species (Admin Mode)"
        value={revealAll}
        onChange={onRevealAllChange}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  panel: { padding: spacing.lg, borderRadius: radii.lg, gap: spacing.md, borderWidth: 1 },
  title: { fontSize: 20, fontFamily: "Outfit_700Bold" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  active: { backgroundColor: colors.forest, borderColor: colors.forest },
  chipText: { color: colors.muted, textTransform: "capitalize" },
  activeText: { color: colors.paper, fontFamily: "Outfit_700Bold" },
  stepper: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
