import { useMemo } from "react";
import { Alert, Platform, ScrollView, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import type { Habit } from "@sprout/shared";
import { ResponsivePageContent } from "../../components/ResponsivePageContent";
import { ScreenState } from "../../components/ScreenState";
import { useAuth } from "../../providers/AuthProvider";
import { useTheme } from "../../providers/ThemeProvider";
import { useCarouselPosition } from "../../providers/CarouselPositionProvider";
import { GardenCarousel } from "../habits/components/GardenCarousel";
import { GardenEmptyCard } from "../habits/components/GardenEmptyCard";
import { HabitCard } from "../habits/components/HabitCard";
import { ReflectionBookSheet } from "../habits/components/ReflectionBookSheet";
import { usePersistedHabitSelection } from "../habits/hooks/usePersistedHabitSelection";
import { FriendForestFilters } from "./FriendForestFilters";
import { FriendGardenHeader } from "./FriendGardenHeader";
import { visibleHabitForVisitor } from "./friendHabitVisibility";
import { useFriendForestFilter } from "./useFriendForestFilter";
import { useFriendGarden } from "./useFriendGarden";
import { useFriendNudges } from "./useFriendNudges";

type FriendForestItem = { kind: "habit"; habit: Habit } | { kind: "empty" };

export function FriendForestScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();
  const garden = useFriendGarden(id);
  const carouselPosition = useCarouselPosition(`friend-forest:${user?.id ?? "guest"}:${id}`);
  const activeHabits = useMemo(
    () =>
      garden.habits
        .filter((item) => item.status !== "completed")
        .map((habit) => visibleHabitForVisitor(habit, user?.id ?? "")),
    [garden.habits, user?.id],
  );
  const forest = useFriendForestFilter(activeHabits);
  const carouselItems = useMemo<FriendForestItem[]>(
    () =>
      forest.visibleHabits.length
        ? forest.visibleHabits.map((habit) => ({ kind: "habit" as const, habit }))
        : [{ kind: "empty" }],
    [forest.visibleHabits],
  );
  const { nudged, nudge } = useFriendNudges(id, Boolean(garden.profile));
  const reflectionBook = usePersistedHabitSelection(user?.id, `friend-forest:${id}`, activeHabits);

  if (garden.profile === undefined && !garden.error)
    return <ScreenState message="Walking to your bud's forest…" />;
  if (!garden.profile)
    return <ScreenState message={garden.error ?? "This forest is unavailable."} error />;

  return (
    <ScrollView
      disableScrollViewPanResponder={Platform.OS === "web"}
      style={[styles.root, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <ResponsivePageContent style={styles.content}>
        <Stack.Screen options={{ headerShown: false }} />
        <FriendGardenHeader
          profile={garden.profile}
          active="forest"
          onLeave={() => router.replace("/(tabs)/buds")}
          onOpenForest={() => undefined}
          onOpenSanctuary={() => router.replace(`/friend-sanctuary/${id}`)}
        />
        <FriendForestFilters
          query={forest.query}
          filter={forest.filter}
          onQueryChange={forest.setQuery}
          onFilterChange={forest.setFilter}
        />
        <GardenCarousel
          items={carouselItems}
          accessibilityLabel={`${garden.profile.display_name || garden.profile.username}'s active plants`}
          initialItemKey={carouselPosition.initialItemKey}
          onFocusedItemChange={carouselPosition.rememberItem}
          keyExtractor={(item) => (item.kind === "habit" ? item.habit.id : "empty")}
          renderCard={(item, cardWidth) =>
            item.kind === "habit" ? (
              <HabitCard
                habit={item.habit}
                viewerId={user?.id}
                wateringsToday={0}
                watering={false}
                cardWidth={cardWidth}
                onOpenReflections={() => reflectionBook.open(item.habit)}
                onNudge={
                  item.habit.status === "withered"
                    ? () =>
                        void nudge(item.habit).catch((cause) =>
                          Alert.alert(
                            "Nudge failed",
                            cause instanceof Error ? cause.message : "Try again",
                          ),
                        )
                    : undefined
                }
                isNudged={nudged.includes(item.habit.id)}
              />
            ) : (
              <GardenEmptyCard
                width={cardWidth}
                icon="🌲"
                title={
                  activeHabits.length ? "No plants match these filters" : "This forest is resting"
                }
                copy={
                  activeHabits.length
                    ? "Try another search or filter."
                    : "There are no public active plants here right now."
                }
              />
            )
          }
        />
        <ReflectionBookSheet habit={reflectionBook.habit} onClose={reflectionBook.close} />
      </ResponsivePageContent>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { alignItems: "center" },
  content: { paddingBottom: 32 },
});
