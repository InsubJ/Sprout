import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import type { Habit, PlantSpecies } from "@sprout/shared";
import type { UploadAsset } from "@sprout/services";
import { useRouter } from "expo-router";
import { colors, spacing } from "@sprout/design-tokens";
import { AppButton } from "../../../components/AppButton";
import { ScreenState } from "../../../components/ScreenState";
import { SearchField } from "../../../components/SearchField";
import { useSync } from "../../../providers/SyncProvider";
import { useTheme } from "../../../providers/ThemeProvider";
import { GardenCarousel } from "../components/GardenCarousel";
import { HabitCard } from "../components/HabitCard";
import { HabitFormSheet } from "../components/HabitFormSheet";
import { WaterReflectionSheet } from "../components/WaterReflectionSheet";
import { useHabits } from "../hooks/useHabits";
import { CompletionConfetti } from "../components/CompletionConfetti";
import {
  nativePlantRegistry,
  plantDisplayName,
} from "../../plants/plantRegistry";
import { useAuth } from "../../../providers/AuthProvider";
import { ReflectionBookSheet } from "../components/ReflectionBookSheet";
import { DiscoHabitCard } from "../../disco/components/DiscoHabitCard";
import { GardenEmptyCard } from "../components/GardenEmptyCard";
type ForestCarouselItem =
  { kind: "habit"; habit: Habit } | { kind: "empty" } | { kind: "disco" };
export function ForestScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const {
    habits,
    wateringsToday,
    lastWateredAt,
    loading,
    error,
    wateringId,
    refresh,
    create,
    water,
  } = useHabits();
  const router = useRouter();
  const { online, syncing, pending } = useSync();
  const theme = useTheme();
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<Habit | null>(null);
  const [reflectionHabit, setReflectionHabit] = useState<Habit | null>(null);
  const [completed, setCompleted] = useState<Habit | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "watered" | "needs-water">(
    "all",
  );
  const gardenerName =
    user && "displayName" in user
      ? user.displayName
      : user &&
          "user_metadata" in user &&
          typeof user.user_metadata?.display_name === "string"
        ? user.user_metadata.display_name
        : (user?.email?.split("@")[0] ?? "Gardener");
  const stats = useMemo(
    () => ({
      healthy: habits.filter((h) => h.status === "healthy").length,
      withered: habits.filter((h) => h.status === "withered").length,
      complete: habits.filter((h) => h.status === "completed").length,
    }),
    [habits],
  );
  const visibleHabits = useMemo(
    () =>
      habits.filter(
        (h) =>
          h.status !== "completed" &&
          (filter === "all" ||
            (filter === "watered"
              ? (wateringsToday[h.id] ?? 0) > 0
              : (wateringsToday[h.id] ?? 0) <
                (h.frequency === "twice_daily" ? 2 : 1))) &&
          (h.name.toLowerCase().includes(query.trim().toLowerCase()) ||
            Boolean(
              h.description?.toLowerCase().includes(query.trim().toLowerCase()),
            )),
      ).sort((a, b) => {
        if (filter !== "all") return 0;
        const statusRank = (status: Habit["status"]) => status === "withered" ? 0 : status === "healthy" ? 1 : 2;
        const statusDifference = statusRank(a.status) - statusRank(b.status);
        if (statusDifference) return statusDifference;
        const aTime = lastWateredAt[a.id] ? new Date(lastWateredAt[a.id]!).getTime() : 0;
        const bTime = lastWateredAt[b.id] ? new Date(lastWateredAt[b.id]!).getTime() : 0;
        return aTime - bTime;
      }),
    [habits, filter, lastWateredAt, query, wateringsToday],
  );
  const carouselItems = useMemo<ForestCarouselItem[]>(
    () => [
      ...(visibleHabits.length
        ? visibleHabits.map((habit) => ({ kind: "habit" as const, habit }))
        : [{ kind: "empty" as const }]),
      { kind: "disco" as const },
    ],
    [visibleHabits],
  );
  const confirmWater = async (
    note?: string,
    imageUrl?: string,
    pendingAsset?: UploadAsset,
  ) => {
    if (!selected) return;
    const willComplete =
      selected.current_waterings + 1 >= selected.target_waterings;
    await water(selected, { note, imageUrl, pendingAsset });
    if (willComplete)
      setCompleted({
        ...selected,
        status: "completed",
        current_waterings: selected.target_waterings,
      });
  };
  return (
    <>
      <ScrollView
        style={[styles.screen, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => void refresh()}
          />
        }
      >
        <View style={styles.heading}>
          <Text style={[styles.eyebrow, theme.dark && styles.eyebrowDark]}>
            YOUR NURSERY
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>
            {gardenerName}'s Nursery
          </Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Grow your virtual forest by maintaining real-life consistency.
          </Text>
          {!online || pending > 0 ? (
            <Text accessibilityLiveRegion="polite" style={styles.sync}>
              {syncing
                ? "Syncing garden…"
                : `${pending} change${pending === 1 ? "" : "s"} waiting to sync`}
            </Text>
          ) : null}
        </View>
        <View
          style={[
            styles.searchArea,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <SearchField value={query} onChangeText={setQuery} />
          <View style={styles.filters}>
            {(["all", "watered", "needs-water"] as const).map((value) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected: filter === value }}
                onPress={() => setFilter(value)}
                style={[
                  styles.filterChip,
                  filter === value && styles.filterChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === value && styles.filterTextSelected,
                  ]}
                >
                  {value === "needs-water" ? "Needs Water" : value}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        {loading && !habits.length ? (
          <ScreenState message="Walking into the woods…" />
        ) : error && !habits.length ? (
          <ScreenState message={error} error />
        ) : (
          <GardenCarousel
            items={carouselItems}
            accessibilityLabel="Your garden plants"
            keyExtractor={(item) =>
              item.kind === "habit" ? item.habit.id : item.kind
            }
            renderCard={(item, cardWidth) =>
              item.kind === "habit" ? (
                <HabitCard
                  habit={item.habit}
                  wateringsToday={wateringsToday[item.habit.id] ?? 0}
                  watering={wateringId === item.habit.id}
                  cardWidth={cardWidth}
                  onWater={() => setSelected(item.habit)}
                  onOpenReflections={() => setReflectionHabit(item.habit)}
                />
              ) : item.kind === "disco" ? (
                <DiscoHabitCard cardWidth={cardWidth} />
              ) : (
                <GardenEmptyCard
                  width={cardWidth}
                  icon={filter === "needs-water" && !query.trim() ? "🎉" : undefined}
                  title={filter === "needs-water" && !query.trim() ? "Congratulations, you’re all caught up" : undefined}
                  copy={filter === "needs-water" && !query.trim() ? "Every active plant has been watered for today." : undefined}
                />
              )
            }
          />
        )}
        <View style={styles.seed}>
          <AppButton
            label="🌱 Plant New Seed"
            onPress={() => setFormOpen(true)}
          />
        </View>
        <View
          style={[
            styles.stats,
            width < 430 && styles.statsCompact,
            { backgroundColor: theme.surface },
          ]}
        >
          <Stat value={habits.length} label="Total Trees" color={theme.text} />
          <Stat
            value={stats.healthy}
            label="Healthy"
            color={theme.dark ? "#9BCB8E" : "#2D5A27"}
          />
          <Stat
            value={stats.withered}
            label="Withered"
            color={theme.dark ? "#F2A594" : "#C26555"}
          />
          <Stat
            value={stats.complete}
            label="Fully Grown"
            color={theme.dark ? "#F6C0B5" : "#EAA89B"}
          />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
      <HabitFormSheet
        visible={formOpen}
        submitting={submitting}
        onClose={() => setFormOpen(false)}
        onSubmit={async (input) => {
          setSubmitting(true);
          try {
            await create(input);
          } finally {
            setSubmitting(false);
          }
        }}
      />
      <WaterReflectionSheet
        habit={selected}
        busy={Boolean(wateringId)}
        onClose={() => setSelected(null)}
        onConfirm={confirmWater}
      />
      <ReflectionBookSheet
        habit={reflectionHabit}
        onClose={() => setReflectionHabit(null)}
      />
      <Modal transparent visible={Boolean(completed)} animationType="fade">
        <View style={styles.celebrationBackdrop}>
          <View
            style={[styles.celebration, { backgroundColor: theme.surface }]}
          >
            <CompletionConfetti />
            <Text style={styles.trophy}>🏆</Text>
            {completed
              ? (() => {
                  const Plant =
                    nativePlantRegistry[completed.plant_type as PlantSpecies] ??
                    nativePlantRegistry.bonsai;
                  return (
                    <Plant
                      currentWaterings={completed.target_waterings}
                      targetWaterings={completed.target_waterings}
                      witherCount={completed.wither_count}
                      status="completed"
                      size={150}
                    />
                  );
                })()
              : null}
            <Text style={[styles.celebrationTitle, { color: theme.text }]}>
              Fully Grown!
            </Text>
            {completed ? (
              <Text style={[styles.celebrationText, { color: theme.muted }]}>
                {completed.name} ·{" "}
                {plantDisplayName(completed.plant_type as PlantSpecies)}
              </Text>
            ) : null}
            <Text style={[styles.celebrationText, { color: theme.muted }]}>
              {completed?.name} has moved to your Sanctuary.
            </Text>
            {completed?.poetic_summary ? (
              <Text style={[styles.celebrationText, { color: theme.muted }]}>
                {completed.poetic_summary}
              </Text>
            ) : null}
            <AppButton
              label="Visit Sanctuary"
              onPress={() => {
                setCompleted(null);
                router.push("/(tabs)/sanctuary");
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
function Stat({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  const theme = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  content: { paddingBottom: spacing.xxl },
  heading: { padding: spacing.lg, paddingTop: spacing.xl },
  eyebrow: {
    color: colors.forest,
    fontSize: 12,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 1.5,
  },
  eyebrowDark: { color: "#9BCB8E" },
  title: {
    color: colors.ink,
    fontSize: 34,
    fontFamily: "Outfit_700Bold",
    marginTop: spacing.xs,
  },
  subtitle: { color: colors.muted, marginTop: spacing.xs },
  searchArea: {
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: 18,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  filterChip: {
    flexGrow: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterChipSelected: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  filterText: { color: colors.muted, textTransform: "capitalize" },
  filterTextSelected: { color: colors.paper, fontFamily: "Outfit_700Bold" },
  sync: {
    alignSelf: "flex-start",
    color: colors.evergreen,
    backgroundColor: colors.leaf,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  seed: { paddingHorizontal: spacing.lg, marginVertical: spacing.sm },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    margin: spacing.lg,
    backgroundColor: colors.paper,
    borderRadius: 18,
    padding: spacing.md,
  },
  statsCompact: { rowGap: spacing.md },
  stat: { flexGrow: 1, flexBasis: 72, alignItems: "center" },
  statValue: {
    color: colors.forest,
    fontSize: 22,
    fontFamily: "Outfit_700Bold",
  },
  statLabel: { color: colors.muted, fontSize: 11 },
  error: { color: colors.danger, textAlign: "center" },
  celebrationBackdrop: {
    flex: 1,
    backgroundColor: "rgba(13,23,41,.68)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  celebration: {
    width: "100%",
    backgroundColor: colors.paper,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
  },
  trophy: { fontSize: 42 },
  celebrationTitle: {
    color: colors.ink,
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
  },
  celebrationText: { color: colors.muted, textAlign: "center" },
});
