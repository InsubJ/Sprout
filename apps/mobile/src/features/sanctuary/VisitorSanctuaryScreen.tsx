import { useMemo } from "react";
import { Platform, ScrollView, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ResponsivePageContent } from "../../components/ResponsivePageContent";
import { LoadingState } from "../../components/LoadingState";
import { ScreenState } from "../../components/ScreenState";
import { useAuth } from "../../providers/AuthProvider";
import { useTheme } from "../../providers/ThemeProvider";
import { useCarouselPosition } from "../../providers/CarouselPositionProvider";
import { GardenCarousel } from "../habits/components/GardenCarousel";
import { GardenEmptyCard } from "../habits/components/GardenEmptyCard";
import { ReflectionBookSheet } from "../habits/components/ReflectionBookSheet";
import { useHabitSelection } from "../habits/hooks/useHabitSelection";
import { FriendGardenHeader } from "../social/FriendGardenHeader";
import { visibleHabitForVisitor } from "../social/friendHabitVisibility";
import { useFriendGarden } from "../social/useFriendGarden";
import { SanctuaryCatalogueControls } from "./SanctuaryCatalogueControls";
import { SanctuaryCustomPlantCard } from "./SanctuaryCustomPlantCard";
import { SanctuaryPlantCard } from "./SanctuaryPlantCard";
import {
  type SanctuaryCatalogueItem,
  useSanctuaryCatalogueFilter,
} from "./useSanctuaryCatalogueFilter";

type VisitorSanctuaryItem = SanctuaryCatalogueItem | { kind: "empty" };

export function VisitorSanctuaryScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();
  const garden = useFriendGarden(id);
  const carouselPosition = useCarouselPosition(`friend-sanctuary:${user?.id ?? "guest"}:${id}`);
  const habits = useMemo(
    () =>
      garden.habits
        .filter((item) => item.status === "completed")
        .map((habit) => visibleHabitForVisitor(habit, user?.id ?? "")),
    [garden.habits, user?.id],
  );
  const catalogue = useSanctuaryCatalogueFilter(habits, garden.customPlants);
  const carouselItems = useMemo<VisitorSanctuaryItem[]>(
    () => (catalogue.items.length ? catalogue.items : [{ kind: "empty" }]),
    [catalogue.items],
  );
  const reflectionBook = useHabitSelection(habits);

  if (garden.profile === undefined && !garden.error)
    return <LoadingState message="Opening your bud's Sanctuary…" />;
  if (!garden.profile)
    return <ScreenState message={garden.error ?? "This Sanctuary is unavailable."} error />;

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
          active="sanctuary"
          onLeave={() => router.replace("/(tabs)/buds")}
          onOpenForest={() => router.replace(`/friend-forest/${id}`)}
          onOpenSanctuary={() => undefined}
        />
        <SanctuaryCatalogueControls
          query={catalogue.query}
          onQuery={catalogue.setQuery}
          filter={catalogue.filter}
          onFilter={catalogue.setFilter}
          sort={catalogue.sort}
          sortDirection={catalogue.sortDirection}
          onSort={catalogue.setSort}
        />
        <GardenCarousel
          items={carouselItems}
          accessibilityLabel={`${garden.profile.display_name || garden.profile.username}'s completed and custom plants`}
          initialItemKey={carouselPosition.initialItemKey}
          onFocusedItemChange={carouselPosition.rememberItem}
          keyExtractor={(item) =>
            item.kind === "custom"
              ? `custom-${item.plant.id}`
              : item.kind === "classic"
                ? `classic-${item.habit.id}`
                : "empty"
          }
          renderCard={(item, cardWidth) =>
            item.kind === "custom" ? (
              <SanctuaryCustomPlantCard plant={item.plant} width={cardWidth} />
            ) : item.kind === "classic" ? (
              <SanctuaryPlantCard
                habit={item.habit}
                width={cardWidth}
                onOpenJournal={() => reflectionBook.open(item.habit)}
              />
            ) : (
              <GardenEmptyCard
                width={cardWidth}
                icon="🌿"
                title={
                  catalogue.hasPlants
                    ? "No plants match these filters"
                    : "No shared Sanctuary plants yet"
                }
                copy={
                  catalogue.hasPlants
                    ? "Try another search or filter."
                    : "Completed and friend-visible custom plants will bloom here when they are ready."
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
