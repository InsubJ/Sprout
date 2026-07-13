import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions } from "react-native";
import type { HabitStatus } from "@sprout/shared";
import { spacing } from "@sprout/design-tokens";
import { AppButton } from "../../components/AppButton";
import { SearchField } from "../../components/SearchField";
import { useTheme } from "../../providers/ThemeProvider";
import { useHabitCollection } from "../habits/hooks/useHabitCollection";
import { nativePlantRegistry } from "../plants/plantRegistry";
import { LabSimulationControls } from "./LabSimulationControls";
import { LabSortDropdown, type LabSortOption } from "./LabSortDropdown";
import { LabSpeciesGrid } from "./LabSpeciesGrid";
import { useLabSpecies } from "./useLabSpecies";

export function LabScreen(): React.JSX.Element {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { habits } = useHabitCollection();
  const [growth, setGrowth] = useState(50);
  const [witherCount, setWitherCount] = useState(0);
  const [status, setStatus] = useState<HabitStatus>("healthy");
  const [revealAll, setRevealAll] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<LabSortOption>("alphabetical");
  const [controlsOpen, setControlsOpen] = useState(false);
  const mobile = width < 768;
  const columns = mobile ? 1 : width >= 1200 ? 4 : 3;
  const cardWidth = Math.floor((width - spacing.lg * 2 - spacing.md * (columns - 1)) / columns);
  const lab = useLabSpecies(habits, search, sort, revealAll, mobile ? 4 : 8);
  const controls = (
    <LabSimulationControls
      growth={growth}
      witherCount={witherCount}
      status={status}
      revealAll={revealAll}
      onGrowthChange={setGrowth}
      onWitherCountChange={setWitherCount}
      onStatusChange={setStatus}
      onRevealAllChange={setRevealAll}
    />
  );
  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: theme.text }]}>Botanical Laboratory</Text>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Simulate growth, setbacks, and variants for all {Object.keys(nativePlantRegistry).length}{" "}
        plant species.
      </Text>
      {mobile ? <AppButton label="Simulate" onPress={() => setControlsOpen(true)} /> : controls}
      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder="Search species by name or rarity..."
      />
      <LabSortDropdown value={sort} onChange={setSort} />
      <LabSpeciesGrid
        species={lab.species}
        completed={lab.completed}
        revealAll={revealAll}
        growth={growth}
        witherCount={witherCount}
        status={status}
        cardWidth={cardWidth}
      />
      <Text style={{ color: theme.text, textAlign: "center" }}>
        Page {lab.page} of {lab.totalPages}
      </Text>
      <Pressable style={styles.pagination}>
        <AppButton
          label="◀ Prev"
          tone="quiet"
          disabled={lab.page === 1}
          onPress={() => lab.setPage((value) => Math.max(1, value - 1))}
        />
        <AppButton
          label="Next ▶"
          tone="quiet"
          disabled={lab.page === lab.totalPages}
          onPress={() => lab.setPage((value) => Math.min(lab.totalPages, value + 1))}
        />
      </Pressable>
      <Modal
        visible={controlsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setControlsOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setControlsOpen(false)}>
          <Pressable
            style={[styles.drawer, { backgroundColor: theme.surface }]}
            onPress={() => undefined}
          >
            {controls}
            <AppButton label="Close" onPress={() => setControlsOpen(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: spacing.lg, paddingTop: spacing.xl, gap: spacing.md },
  title: { fontSize: 32, fontFamily: "Outfit_700Bold" },
  subtitle: { lineHeight: 21 },
  pagination: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,.55)", justifyContent: "flex-end" },
  drawer: {
    padding: spacing.lg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: spacing.md,
  },
});
