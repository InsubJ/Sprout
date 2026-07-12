import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Slider from "@react-native-community/slider";
import { AppSwitch } from "../../components/AppSwitch";
import {
  getTierForSpecies,
  type DifficultyTier,
  type HabitStatus,
  type PlantSpecies,
} from "@sprout/shared";
import { colors, radii, spacing } from "@sprout/design-tokens";
import { AppButton } from "../../components/AppButton";
import { SearchField } from "../../components/SearchField";
import { useTheme } from "../../providers/ThemeProvider";
import { useHabits } from "../habits/hooks/useHabits";
import { nativePlantRegistry, plantDisplayName } from "../plants/plantRegistry";
import { LabSortDropdown, type LabSortOption } from "./LabSortDropdown";
const tierColors: Record<DifficultyTier, string> = {
  common: "#689F38",
  uncommon: "#4CAF50",
  rare: "#E91E63",
  mythical: "#FFC107",
};
export function LabScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { habits } = useHabits();
  const [growth, setGrowth] = useState(50);
  const [witherCount, setWitherCount] = useState(0);
  const [status, setStatus] = useState<HabitStatus>("healthy");
  const [revealAll, setRevealAll] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<LabSortOption>("alphabetical");
  const [page, setPage] = useState(1);
  const [controls, setControls] = useState(false);
  const mobile = width < 768;
  const columns = mobile ? 1 : width >= 1200 ? 4 : 3;
  const cardWidth = Math.floor(
    (width - spacing.lg * 2 - spacing.md * (columns - 1)) / columns,
  );
  const completed = useMemo(
    () =>
      new Set(
        habits
          .filter((habit) => habit.status === "completed")
          .map((habit) => habit.plant_type),
      ),
    [habits],
  );
  const dates = useMemo(
    () =>
      habits.reduce<Record<string, number>>((result, habit) => {
        if (habit.status === "completed")
          result[habit.plant_type] = Math.max(
            result[habit.plant_type] ?? 0,
            new Date(habit.completed_at ?? habit.created_at).getTime(),
          );
        return result;
      }, {}),
    [habits],
  );
  const species = useMemo(
    () =>
      (Object.keys(nativePlantRegistry) as PlantSpecies[])
        .filter((item) => {
          const tier = getTierForSpecies(item);
          const query = search.trim().toLowerCase();
          return (
            plantDisplayName(item).toLowerCase().includes(query) ||
            tier.includes(query)
          );
        })
        .sort((a, b) => {
          const unlockedA = revealAll || completed.has(a);
          const unlockedB = revealAll || completed.has(b);
          if (unlockedA !== unlockedB) return unlockedA ? -1 : 1;
          if (sort === "rarity") {
            const rank = { mythical: 0, rare: 1, uncommon: 2, common: 3 };
            return (
              rank[getTierForSpecies(a)] - rank[getTierForSpecies(b)] ||
              plantDisplayName(a).localeCompare(plantDisplayName(b))
            );
          }
          if (sort === "newest")
            return (
              (dates[b] ?? 0) - (dates[a] ?? 0) ||
              plantDisplayName(a).localeCompare(plantDisplayName(b))
            );
          return plantDisplayName(a).localeCompare(plantDisplayName(b));
        }),
    [completed, dates, revealAll, search, sort],
  );
  const pageSize = mobile ? 4 : 8;
  const totalPages = Math.max(1, Math.ceil(species.length / pageSize));
  const current = species.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [search, sort, pageSize]);
  useEffect(
    () => setPage((value) => Math.min(value, totalPages)),
    [totalPages],
  );
  const controlsPanel = (
    <View
      style={[
        styles.panel,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <Text style={[styles.panelTitle, { color: theme.text }]}>
        Simulation Controls
      </Text>
      <Text style={{ color: theme.text }}>Growth Progress: {growth}%</Text>
      <Slider
        accessibilityLabel="Growth Progress"
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={growth}
        onValueChange={setGrowth}
        minimumTrackTintColor={colors.forest}
        maximumTrackTintColor={theme.muted}
      />
      <Text style={{ color: theme.text }}>Plant Status</Text>
      <View style={styles.row}>
        {(["healthy", "withered", "completed"] as const).map((value) => (
          <Chip
            key={value}
            label={`${value === "healthy" ? "🌱" : value === "withered" ? "🍂" : "🌸"} ${value}`}
            active={status === value}
            onPress={() => setStatus(value)}
          />
        ))}
      </View>
      <View style={styles.stepper}>
        <Text style={{ color: theme.text }}>Setbacks: {witherCount}</Text>
        <View style={styles.row}>
          <AppButton
            label="−"
            tone="quiet"
            onPress={() => setWitherCount((value) => Math.max(0, value - 1))}
          />
          <AppButton
            label="+"
            tone="quiet"
            onPress={() => setWitherCount((value) => value + 1)}
          />
        </View>
      </View>
      <View style={styles.switchRow}>
        <Text style={{ color: theme.text, flex: 1 }}>
          Reveal all species (Admin Mode)
        </Text>
        <AppSwitch
          accessibilityLabel="Reveal all species Admin Mode"
          value={revealAll}
          onValueChange={setRevealAll}
        />
      </View>
    </View>
  );
  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: theme.text }]}>
        Botanical Laboratory
      </Text>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Simulate growth, setbacks, and variants for all{" "}
        {Object.keys(nativePlantRegistry).length} plant species.
      </Text>
      {mobile ? (
        <AppButton label="Simulate" onPress={() => setControls(true)} />
      ) : (
        controlsPanel
      )}
      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder="Search species by name or rarity..."
      />
      <LabSortDropdown value={sort} onChange={setSort} />
      <View style={styles.grid}>
        {current.map((item) => {
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
                  <View style={styles.cardHeader}>
                    <Text style={[styles.name, { color: theme.text }]}>
                      {plantDisplayName(item)}
                    </Text>
                    <Text
                      style={[
                        styles.badge,
                        {
                          color: tierColors[tier],
                          backgroundColor: `${tierColors[tier]}22`,
                        },
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
                  <View style={styles.cardHeader}>
                    <Text style={[styles.name, { color: theme.text }]}>
                      ❓ Unknown Plant
                    </Text>
                    <Text style={[styles.lockedBadge, { color: theme.muted }]}>
                      Locked
                    </Text>
                  </View>
                  <Text style={styles.lock}>🔒</Text>
                  <Text style={[styles.details, { color: theme.muted }]}>
                    Not discovered yet. Grow and complete this species in Sprout
                    to unlock.
                  </Text>
                </>
              )}
            </View>
          );
        })}
      </View>
      <View style={styles.pagination}>
        <AppButton
          label="◀ Prev"
          tone="quiet"
          disabled={page === 1}
          onPress={() => setPage((value) => Math.max(1, value - 1))}
        />
        <Text style={{ color: theme.text }}>
          Page {page} of {totalPages}
        </Text>
        <AppButton
          label="Next ▶"
          tone="quiet"
          disabled={page === totalPages}
          onPress={() => setPage((value) => Math.min(totalPages, value + 1))}
        />
      </View>
      <Modal
        visible={controls}
        transparent
        animationType="slide"
        onRequestClose={() => setControls(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setControls(false)}>
          <Pressable
            style={[styles.drawer, { backgroundColor: theme.surface }]}
            onPress={() => undefined}
          >
            {controlsPanel}
            <AppButton label="Close" onPress={() => setControls(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress(): void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: spacing.lg, paddingTop: spacing.xl, gap: spacing.md },
  title: { fontSize: 32, fontFamily: "Outfit_700Bold" },
  subtitle: { lineHeight: 21 },
  panel: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    gap: spacing.md,
    borderWidth: 1,
  },
  panelTitle: { fontSize: 20, fontFamily: "Outfit_700Bold" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  chipText: { color: colors.muted, textTransform: "capitalize" },
  chipTextActive: { color: colors.paper, fontFamily: "Outfit_700Bold" },
  stepper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchRow: { flexDirection: "row", alignItems: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  card: {
    height: 340,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeader: { width: "100%", flexDirection: "row", alignItems: "center" },
  name: { flex: 1, fontSize: 17, fontFamily: "Outfit_700Bold" },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
    textTransform: "capitalize",
  },
  lockedBadge: {
    backgroundColor: "#E5E7EB",
    padding: spacing.xs,
    borderRadius: 999,
    overflow: "hidden",
  },
  lock: { fontSize: 58 },
  details: { textAlign: "center", fontSize: 12 },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.55)",
    justifyContent: "flex-end",
  },
  drawer: {
    padding: spacing.lg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: spacing.md,
  },
});
