import { StyleSheet, Text, View } from "react-native";
import type { Habit, PlantSpecies } from "@sprout/shared";
import { radii, spacing } from "@sprout/design-tokens";
import { AppButton } from "../../components/AppButton";
import { useTheme } from "../../providers/ThemeProvider";
import { nativePlantRegistry, plantDisplayName } from "../plants/plantRegistry";
import { normalizePlantSpecies } from "../plants/components/PlantRenderer";
import { gardenCardGeometry } from "../habits/components/gardenCardGeometry";
import { HoldToRevealDeleteCard } from "./HoldToRevealDeleteCard";

const rarityBorder = {
  common: "#6F9B68",
  uncommon: "#3FA868",
  rare: "#D34C8B",
  mythical: "#D6A719",
} as const;

export function SanctuaryPlantCard({
  habit,
  width,
  displayName,
  onOpenJournal,
  onRequestDelete,
}: {
  habit: Habit;
  width: number;
  displayName?: string;
  onOpenJournal(): void;
  onRequestDelete?(habit: Habit): void;
}): React.JSX.Element {
  const theme = useTheme();
  const species = normalizePlantSpecies(habit.plant_type);
  const Plant = nativePlantRegistry[species as PlantSpecies] ?? nativePlantRegistry.bonsai;
  const plantName = displayName ?? habit.name;
  const cardStyle = [
    styles.card,
    { width, backgroundColor: theme.surface, borderColor: rarityBorder[habit.difficulty_tier] },
  ];
  const content = (
    <View style={styles.content}>
      <View>
        <Text style={[styles.name, { color: theme.text }]}>{plantName}</Text>
        <Text style={[styles.species, { color: theme.muted }]}>
          {plantDisplayName(species)} · Fully grown
        </Text>
      </View>
      <View style={[styles.scene, { backgroundColor: theme.elevated, borderColor: theme.border }]}>
        <Plant
          currentWaterings={habit.target_waterings}
          targetWaterings={habit.target_waterings}
          witherCount={habit.wither_count}
          status="completed"
          size={220}
        />
      </View>
      <Text numberOfLines={3} style={[styles.summary, { color: theme.muted }]}>
        {habit.poetic_summary ?? "A quiet record of returning, caring, and growing."}
      </Text>
      <View style={[styles.metrics, { backgroundColor: theme.elevated }]}>
        <Metric label="Acts of care" value={habit.target_waterings} />
        <Metric label="Best streak" value={habit.max_streak} />
        <Metric label="Setbacks" value={habit.wither_count} />
      </View>
      <Text style={[styles.date, { color: theme.muted }]}>
        Completed {new Date(habit.completed_at ?? habit.created_at).toLocaleDateString()}
      </Text>
      <AppButton label="Open Reflection Book" tone="quiet" onPress={onOpenJournal} />
    </View>
  );

  return onRequestDelete ? (
    <HoldToRevealDeleteCard
      plantName={plantName}
      style={cardStyle}
      onRequestDelete={() => onRequestDelete(habit)}
    >
      {content}
    </HoldToRevealDeleteCard>
  ) : (
    <View style={cardStyle}>{content}</View>
  );
}

function Metric({ label, value }: { label: string; value: number }): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: gardenCardGeometry.height,
    borderWidth: 2,
    borderRadius: 20,
    shadowColor: "#18321E",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    overflow: "hidden",
  },
  content: {
    minHeight: gardenCardGeometry.height - 4,
    padding: gardenCardGeometry.padding,
    gap: spacing.md,
  },
  name: { fontSize: 22, fontFamily: "Outfit_700Bold" },
  species: { marginTop: 3, fontFamily: "Outfit_500Medium" },
  scene: {
    height: 250,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  summary: { minHeight: 58, lineHeight: 19, fontStyle: "italic" },
  metrics: { flexDirection: "row", borderRadius: radii.md, padding: spacing.sm },
  metric: { flex: 1, alignItems: "center" },
  metricValue: { fontSize: 18, fontFamily: "Outfit_700Bold" },
  metricLabel: { fontSize: 10, textAlign: "center" },
  date: { fontSize: 12, textAlign: "center" },
});
