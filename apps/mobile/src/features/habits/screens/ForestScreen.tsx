import { useMemo, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import type { Habit } from "@sprout/shared";
import type { UploadAsset } from "@sprout/services";
import { colors, spacing } from "@sprout/design-tokens";
import { useRouter } from "expo-router";
import { AppButton } from "../../../components/AppButton";
import { ResponsivePageContent } from "../../../components/ResponsivePageContent";
import { LoadingState } from "../../../components/LoadingState";
import { ScreenState } from "../../../components/ScreenState";
import { useAuth } from "../../../providers/AuthProvider";
import { useSync } from "../../../providers/SyncProvider";
import { useTheme } from "../../../providers/ThemeProvider";
import { useCarouselPosition } from "../../../providers/CarouselPositionProvider";
import { DiscoHabitCard } from "../../disco/components/DiscoHabitCard";
import { CompletionCelebrationSheet } from "../components/CompletionCelebrationSheet";
import { ForestFilters } from "../components/ForestFilters";
import { ForestHeader } from "../components/ForestHeader";
import { ForestStats } from "../components/ForestStats";
import { GardenCarousel } from "../components/GardenCarousel";
import { GardenEmptyCard } from "../components/GardenEmptyCard";
import { HabitCard } from "../components/HabitCard";
import { HabitFormSheet } from "../components/HabitFormSheet";
import { ReflectionBookSheet } from "../components/ReflectionBookSheet";
import { WaterReflectionSheet } from "../components/WaterReflectionSheet";
import { useForestFilter } from "../hooks/useForestFilter";
import { useHabits } from "../hooks/useHabits";
import { useHabitSelection } from "../hooks/useHabitSelection";
import { useWaterReflectionDraft } from "../hooks/useWaterReflectionDraft";

type ForestCarouselItem = { kind: "habit"; habit: Habit } | { kind: "empty" } | { kind: "disco" };
export function ForestScreen(): React.JSX.Element {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const sync = useSync();
  const theme = useTheme();
  const habitState = useHabits();
  const carouselPosition = useCarouselPosition(`forest:${user?.id ?? "guest"}`);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState<Habit | null>(null);
  const wateringDraft = useWaterReflectionDraft(user?.id);
  const selected = useMemo(
    () => habitState.habits.find((habit) => habit.id === wateringDraft.habitId) ?? null,
    [habitState.habits, wateringDraft.habitId],
  );
  const reflectionBook = useHabitSelection(habitState.habits);
  const forest = useForestFilter(
    habitState.habits,
    habitState.wateringsToday,
    habitState.lastWateredAt,
  );
  const gardenerName =
    user && "displayName" in user
      ? user.displayName
      : user && "user_metadata" in user && typeof user.user_metadata?.display_name === "string"
        ? user.user_metadata.display_name
        : (user?.email?.split("@")[0] ?? "Gardener");
  const items = useMemo<ForestCarouselItem[]>(
    () => [
      ...(forest.visibleHabits.length
        ? forest.visibleHabits.map((habit) => ({ kind: "habit" as const, habit }))
        : [{ kind: "empty" as const }]),
      { kind: "disco" as const },
    ],
    [forest.visibleHabits],
  );
  const confirmWater = async (
    note?: string,
    imageUrl?: string,
    pendingAsset?: UploadAsset,
  ): Promise<void> => {
    if (!selected) return;
    const willComplete = selected.current_waterings + 1 >= selected.target_waterings;
    await habitState.water(selected, { note, imageUrl, pendingAsset });
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
        disableScrollViewPanResponder={Platform.OS === "web"}
        style={[styles.screen, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={habitState.loading}
            onRefresh={() => void habitState.refresh()}
          />
        }
      >
        <ResponsivePageContent style={styles.content}>
          <ForestHeader
            gardenerName={gardenerName}
            online={sync.online}
            syncing={sync.syncing}
            pending={sync.pending}
          />
          <ForestFilters
            query={forest.query}
            filter={forest.filter}
            onQueryChange={forest.setQuery}
            onFilterChange={forest.setFilter}
          />
          {habitState.loading && !habitState.habits.length ? (
            <LoadingState message="Walking into the woods…" />
          ) : habitState.error && !habitState.habits.length ? (
            <ScreenState message={habitState.error} error />
          ) : (
            <GardenCarousel
              items={items}
              accessibilityLabel="Your garden plants"
              initialItemKey={carouselPosition.initialItemKey}
              onFocusedItemChange={carouselPosition.rememberItem}
              keyExtractor={(item) => (item.kind === "habit" ? item.habit.id : item.kind)}
              renderCard={(item, cardWidth) =>
                item.kind === "habit" ? (
                  <HabitCard
                    habit={item.habit}
                    wateringsToday={habitState.wateringsToday[item.habit.id] ?? 0}
                    watering={habitState.wateringId === item.habit.id}
                    cardWidth={cardWidth}
                    onWater={() => wateringDraft.start(item.habit.id)}
                    onOpenReflections={() => reflectionBook.open(item.habit)}
                  />
                ) : item.kind === "disco" ? (
                  <DiscoHabitCard cardWidth={cardWidth} />
                ) : (
                  <GardenEmptyCard
                    width={cardWidth}
                    icon={
                      forest.filter === "needs-water" && !forest.query.trim() ? "🎉" : undefined
                    }
                    title={
                      forest.filter === "needs-water" && !forest.query.trim()
                        ? "Congratulations, you’re all caught up"
                        : undefined
                    }
                    copy={
                      forest.filter === "needs-water" && !forest.query.trim()
                        ? "Every active plant has been watered for today."
                        : undefined
                    }
                  />
                )
              }
            />
          )}
          <View style={styles.seed}>
            <AppButton label="🌱 Plant New Seed" onPress={() => setFormOpen(true)} />
          </View>
          <ForestStats habits={habitState.habits} compact={width < 430} />
          {habitState.error ? <Text style={styles.error}>{habitState.error}</Text> : null}
        </ResponsivePageContent>
      </ScrollView>
      <HabitFormSheet
        visible={formOpen}
        submitting={submitting}
        onClose={() => setFormOpen(false)}
        onSubmit={async (input) => {
          setSubmitting(true);
          try {
            await habitState.create(input);
          } finally {
            setSubmitting(false);
          }
        }}
      />
      <WaterReflectionSheet
        habit={selected}
        busy={Boolean(habitState.wateringId)}
        note={wateringDraft.note}
        imageUri={wateringDraft.imageUri}
        onNoteChange={wateringDraft.setNote}
        onImageUriChange={wateringDraft.setImageUri}
        onClose={wateringDraft.discard}
        onConfirm={confirmWater}
      />
      <ReflectionBookSheet habit={reflectionBook.habit} onClose={reflectionBook.close} />
      <CompletionCelebrationSheet
        habit={completed}
        onVisitSanctuary={() => {
          setCompleted(null);
          router.push("/(tabs)/sanctuary");
        }}
      />
    </>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  scrollContent: { alignItems: "center" },
  content: { paddingBottom: spacing.xxl },
  seed: { paddingHorizontal: spacing.lg, marginVertical: spacing.sm },
  error: { color: colors.danger, textAlign: "center" },
});
