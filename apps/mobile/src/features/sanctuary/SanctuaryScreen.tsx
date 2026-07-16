import { Platform, ScrollView, StyleSheet, Text } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { ScreenState } from "../../components/ScreenState";
import { ResponsivePageContent } from "../../components/ResponsivePageContent";
import { useTheme } from "../../providers/ThemeProvider";
import { useAuth } from "../../providers/AuthProvider";
import { useCarouselPosition } from "../../providers/CarouselPositionProvider";
import { GardenCarousel } from "../habits/components/GardenCarousel";
import { ReflectionBookSheet } from "../habits/components/ReflectionBookSheet";
import { usePersistedHabitSelection } from "../habits/hooks/usePersistedHabitSelection";
import { SanctuaryCatalogueControls } from "./SanctuaryCatalogueControls";
import { SanctuaryCustomPlantCard } from "./SanctuaryCustomPlantCard";
import { SanctuaryPlantCard } from "./SanctuaryPlantCard";
import { useSanctuaryCatalogue } from "./useSanctuaryCatalogue";
import { DeleteSanctuaryPlantConfirmationSheet } from "./DeleteSanctuaryPlantConfirmationSheet";
import { SanctuaryEmptyCard } from "./SanctuaryEmptyCard";
import { useSanctuaryPlantDeletion } from "./useSanctuaryPlantDeletion";
export function SanctuaryScreen() {
  const { user } = useAuth();
  const theme = useTheme(),
    catalogue = useSanctuaryCatalogue();
  const carouselPosition = useCarouselPosition(`sanctuary:${user?.id ?? "guest"}`);
  const deletion = useSanctuaryPlantDeletion(catalogue.deleteCustomPlant, catalogue.deleteHabit);
  const reflectionBook = usePersistedHabitSelection(user?.id, "sanctuary", catalogue.classicHabits);
  return (
    <>
      <ScrollView
        disableScrollViewPanResponder={Platform.OS === "web"}
        style={[styles.root, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
      >
        <ResponsivePageContent style={styles.content}>
          <Text style={[styles.eyebrow, theme.dark && styles.eyebrowDark]}>MEMORY GARDEN</Text>
          <Text style={[styles.title, { color: theme.text }]}>Sanctuary</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Every completed habit leaves a living story.
          </Text>
          <SanctuaryCatalogueControls
            query={catalogue.query}
            onQuery={catalogue.setQuery}
            filter={catalogue.filter}
            onFilter={catalogue.setFilter}
            sort={catalogue.sort}
            sortDirection={catalogue.sortDirection}
            onSort={catalogue.setSort}
          />
          {catalogue.loading && !catalogue.items.length ? (
            <ScreenState message="Opening the Sanctuary…" />
          ) : catalogue.items.length ? (
            <GardenCarousel
              items={catalogue.items}
              accessibilityLabel="Classic and custom plants in your Sanctuary"
              initialItemKey={carouselPosition.initialItemKey}
              onFocusedItemChange={carouselPosition.rememberItem}
              keyExtractor={(item) =>
                item.kind === "custom" ? `custom-${item.plant.id}` : `classic-${item.habit.id}`
              }
              renderCard={(item, width) =>
                item.kind === "custom" ? (
                  <SanctuaryCustomPlantCard
                    plant={item.plant}
                    width={width}
                    onRequestDelete={deletion.requestCustomPlantDeletion}
                  />
                ) : (
                  <SanctuaryPlantCard
                    habit={item.habit}
                    width={width}
                    onOpenJournal={() => reflectionBook.open(item.habit)}
                    onRequestDelete={deletion.requestHabitDeletion}
                  />
                )
              }
            />
          ) : (
            <SanctuaryEmptyCard filtered={catalogue.hasPlants} />
          )}
          {catalogue.error ? (
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {catalogue.error}
            </Text>
          ) : null}
        </ResponsivePageContent>
      </ScrollView>
      <ReflectionBookSheet habit={reflectionBook.habit} onClose={reflectionBook.close} />
      <DeleteSanctuaryPlantConfirmationSheet
        target={deletion.target}
        deleting={deletion.deleting}
        error={deletion.error}
        onCancel={deletion.cancelDeletion}
        onConfirm={() => void deletion.confirmDeletion()}
      />
    </>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  scrollContent: { alignItems: "center" },
  content: { paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  eyebrow: {
    color: colors.forest,
    fontSize: 12,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 1.5,
    marginHorizontal: spacing.lg,
  },
  eyebrowDark: { color: "#9BCB8E" },
  title: {
    color: colors.ink,
    fontSize: 32,
    fontFamily: "Outfit_700Bold",
    marginHorizontal: spacing.lg,
  },
  subtitle: { color: colors.muted, marginTop: spacing.xs, marginHorizontal: spacing.lg },
  error: { color: colors.danger, textAlign: "center", paddingHorizontal: spacing.lg },
});
