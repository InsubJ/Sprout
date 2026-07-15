import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { spacing } from "@sprout/design-tokens";
import { AppButton } from "../../components/AppButton";
import {
  PAGE_CONTENT_MAX_WIDTH,
  ResponsivePageContent,
} from "../../components/ResponsivePageContent";
import { SearchField } from "../../components/SearchField";
import { useTheme } from "../../providers/ThemeProvider";
import { useHabitCollection } from "../habits/hooks/useHabitCollection";
import { nativePlantRegistry } from "../plants/plantRegistry";
import { LabSimulationControls } from "./LabSimulationControls";
import { LabSortDropdown, type LabSortOption } from "./LabSortDropdown";
import { LabSpeciesGrid } from "./LabSpeciesGrid";
import { calculateLabResponsiveLayout } from "./labResponsiveLayout";
import { labStatusFromProgress, type LabPreviewStatus } from "./labSimulationStatus";
import { useLabSpecies } from "./useLabSpecies";

export function LabScreen(): React.JSX.Element {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { habits } = useHabitCollection();
  const [growth, setGrowth] = useState(50);
  const [status, setStatus] = useState<LabPreviewStatus>("healthy");
  const [revealAll, setRevealAll] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<LabSortOption>("alphabetical");
  const [controlsOpen, setControlsOpen] = useState(false);
  const [measuredContentWidth, setMeasuredContentWidth] = useState<number | null>(null);
  const contentWidth = measuredContentWidth ?? Math.min(width, PAGE_CONTENT_MAX_WIDTH);
  const layout = calculateLabResponsiveLayout(contentWidth);
  const compact = contentWidth < 768;
  const lab = useLabSpecies(habits, search, sort, revealAll, layout.pageSize);
  const renderedStatus = labStatusFromProgress(growth, status);
  const measureContent = (event: LayoutChangeEvent): void => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth > 0 && nextWidth !== measuredContentWidth) setMeasuredContentWidth(nextWidth);
  };
  const controls = (
    <LabSimulationControls
      growth={growth}
      status={status}
      revealAll={revealAll}
      onGrowthChange={setGrowth}
      onStatusChange={setStatus}
      onRevealAllChange={setRevealAll}
    />
  );
  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <ResponsivePageContent style={styles.content} onLayout={measureContent}>
        <Text style={[styles.title, { color: theme.text }]}>Botanical Laboratory</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Preview growth and healthy or withered variants for all{" "}
          {Object.keys(nativePlantRegistry).length} plant species.
        </Text>
        {compact ? <AppButton label="Simulate" onPress={() => setControlsOpen(true)} /> : controls}
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
          status={renderedStatus}
          cardWidth={layout.cardWidth}
        />
        <Text style={{ color: theme.text, textAlign: "center" }}>
          Page {lab.page} of {lab.totalPages}
        </Text>
        <View style={styles.pagination}>
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
        </View>
      </ResponsivePageContent>
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
  scrollContent: { alignItems: "center" },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
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
