import { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text } from "react-native";
import type { Habit } from "@sprout/shared";
import { colors, spacing } from "@sprout/design-tokens";
import { ScreenState } from "../../components/ScreenState";
import { useTheme } from "../../providers/ThemeProvider";
import { GardenCarousel } from "../habits/components/GardenCarousel";
import { ReflectionBookSheet } from "../habits/components/ReflectionBookSheet";
import { SanctuaryCatalogueControls } from "./SanctuaryCatalogueControls";
import { SanctuaryCustomPlantCard } from "./SanctuaryCustomPlantCard";
import { SanctuaryPlantCard } from "./SanctuaryPlantCard";
import { useSanctuaryCatalogue } from "./useSanctuaryCatalogue";
import { DeleteCustomPlantConfirmationSheet } from "./DeleteCustomPlantConfirmationSheet";
import { useSanctuaryPlantDeletion } from "./useSanctuaryPlantDeletion";
export function SanctuaryScreen() {
  const theme = useTheme(),
    catalogue = useSanctuaryCatalogue();
  const deletion = useSanctuaryPlantDeletion(catalogue.deleteCustomPlant);
  const [selected, setSelected] = useState<Habit | null>(null);
  return (
    <>
      <ScrollView
        disableScrollViewPanResponder={Platform.OS === "web"}
        style={[styles.root, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
      >
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
          onSort={catalogue.setSort}
        />
        {catalogue.loading && !catalogue.items.length ? (
          <ScreenState message="Opening the Sanctuary…" />
        ) : catalogue.items.length ? (
          <GardenCarousel
            items={catalogue.items}
            accessibilityLabel="Classic and custom plants in your Sanctuary"
            keyExtractor={(item) =>
              item.kind === "custom" ? `custom-${item.plant.id}` : `classic-${item.habit.id}`
            }
            renderCard={(item, width) =>
              item.kind === "custom" ? (
                <SanctuaryCustomPlantCard
                  plant={item.plant}
                  width={width}
                  onRequestDelete={deletion.requestDeletion}
                />
              ) : (
                <SanctuaryPlantCard
                  habit={item.habit}
                  width={width}
                  onOpenJournal={() => setSelected(item.habit)}
                />
              )
            }
          />
        ) : (
          <ScreenState message="Completed and custom plants will bloom here." />
        )}
        {catalogue.error ? (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {catalogue.error}
          </Text>
        ) : null}
      </ScrollView>
      <ReflectionBookSheet habit={selected} onClose={() => setSelected(null)} />
      <DeleteCustomPlantConfirmationSheet
        plant={deletion.plant}
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
