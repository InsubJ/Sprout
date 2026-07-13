import { StyleSheet, Text, View } from "react-native";
import {
  getTierForSpecies,
  type DifficultyTier,
  type HabitStatus,
  type PlantSpecies,
} from "@sprout/shared";
import { radii, spacing } from "@sprout/design-tokens";
import { useTheme } from "../../providers/ThemeProvider";
import { nativePlantRegistry, plantDisplayName } from "../plants/plantRegistry";

const colors: Record<DifficultyTier, string> = {
  common: "#689F38",
  uncommon: "#4CAF50",
  rare: "#E91E63",
  mythical: "#FFC107",
};
export function LabSpeciesGrid({
  species,
  completed,
  revealAll,
  growth,
  witherCount,
  status,
  cardWidth,
}: {
  species: PlantSpecies[];
  completed: Set<string>;
  revealAll: boolean;
  growth: number;
  witherCount: number;
  status: HabitStatus;
  cardWidth: number;
}): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={styles.grid}>
      {species.map((item) => {
        const unlocked = revealAll || completed.has(item);
        const tier = getTierForSpecies(item);
        const Renderer = nativePlantRegistry[item];
        return (
          <View
            key={item}
            style={[
              styles.card,
              { width: cardWidth, backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            {unlocked ? (
              <>
                <View style={styles.header}>
                  <Text style={[styles.name, { color: theme.text }]}>{plantDisplayName(item)}</Text>
                  <Text
                    style={[
                      styles.badge,
                      { color: colors[tier], backgroundColor: `${colors[tier]}22` },
                    ]}
                  >
                    {tier}
                  </Text>
                </View>
                <Renderer
                  currentWaterings={growth}
                  targetWaterings={100}
                  witherCount={witherCount}
                  status={status}
                  size={220}
                />
                <Text style={[styles.details, { color: theme.muted }]}>
                  Waterings: {growth} / 100 · Setbacks: {witherCount}
                </Text>
              </>
            ) : (
              <>
                <View style={styles.header}>
                  <Text style={[styles.name, { color: theme.text }]}>❓ Unknown Plant</Text>
                  <Text style={[styles.locked, { color: theme.muted }]}>Locked</Text>
                </View>
                <Text style={styles.lock}>🔒</Text>
                <Text style={[styles.details, { color: theme.muted }]}>
                  Not discovered yet. Grow and complete this species in Sprout to unlock.
                </Text>
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  card: {
    height: 340,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: { width: "100%", flexDirection: "row", alignItems: "center" },
  name: { flex: 1, fontSize: 17, fontFamily: "Outfit_700Bold" },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
    textTransform: "capitalize",
  },
  locked: {
    backgroundColor: "#E5E7EB",
    padding: spacing.xs,
    borderRadius: 999,
    overflow: "hidden",
  },
  lock: { fontSize: 58 },
  details: { textAlign: "center", fontSize: 12 },
});
