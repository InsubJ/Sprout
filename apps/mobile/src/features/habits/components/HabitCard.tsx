import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Habit } from "@sprout/shared";
import { radii } from "@sprout/design-tokens";
import { useTheme } from "../../../providers/ThemeProvider";
import { normalizePlantSpecies } from "../../plants/components/PlantRenderer";
import { plantDisplayName } from "../../plants/plantRegistry";
import { gardenCardGeometry } from "./gardenCardGeometry";
import { HabitCardFooter } from "./HabitCardFooter";
import { HabitCardHeader } from "./HabitCardHeader";
import { HabitHydrationSummary } from "./HabitHydrationSummary";
import { HabitPlantScene } from "./HabitPlantScene";

interface HabitCardProps {
  habit: Habit;
  wateringsToday: number;
  watering: boolean;
  cardWidth?: number;
  viewerId?: string;
  onWater?: () => void;
  onOpenReflections?: () => void;
  onNudge?: () => void;
  isNudged?: boolean;
  nudgeLoading?: boolean;
}

export function HabitCard({
  habit,
  wateringsToday,
  watering,
  cardWidth = gardenCardGeometry.width,
  viewerId,
  onWater,
  onOpenReflections,
  onNudge,
  isNudged = false,
  nudgeLoading = false,
}: HabitCardProps): React.JSX.Element {
  if (
    !habit.name.trim() ||
    habit.target_waterings <= 0 ||
    habit.current_waterings < 0 ||
    habit.wither_threshold <= 0 ||
    habit.consecutive_misses < 0 ||
    habit.wither_count < 0
  )
    throw new Error("Habit card values are invalid");
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const owner = Boolean(onWater);
  const nameVisible =
    owner || !habit.hide_name || Boolean(viewerId && habit.share_name_friends?.includes(viewerId));
  const descriptionVisible =
    owner ||
    !habit.hide_description ||
    Boolean(viewerId && habit.share_desc_friends?.includes(viewerId));
  return (
    <View
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      style={[
        styles.card,
        hovered && styles.hovered,
        {
          width: cardWidth,
          height: gardenCardGeometry.height,
          padding: gardenCardGeometry.padding,
          gap: gardenCardGeometry.gap,
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <HabitCardHeader habit={habit} name={nameVisible ? habit.name : "Private Plant"} />
      <HabitPlantScene
        habit={habit}
        wateringsToday={wateringsToday}
        watering={watering}
        owner={owner}
        onWater={onWater}
        onOpenReflections={onOpenReflections}
      />
      <View
        style={[styles.specimen, { backgroundColor: theme.elevated, borderColor: theme.border }]}
      >
        <Text style={{ color: theme.muted }}>Plant Specimen:</Text>
        <Text style={[styles.specimenName, { color: theme.text }]}>
          {plantDisplayName(normalizePlantSpecies(habit.plant_type))}
        </Text>
      </View>
      <Text numberOfLines={2} style={[styles.description, { color: theme.muted }]}>
        {descriptionVisible
          ? habit.description || "A habit growing one act at a time."
          : "Private description"}
      </Text>
      <HabitHydrationSummary habit={habit} />
      <HabitCardFooter
        habit={habit}
        onNudge={onNudge}
        isNudged={isNudged}
        nudgeLoading={nudgeLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    shadowColor: "#17351C",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
    overflow: "hidden",
  },
  hovered: { transform: [{ translateY: -6 }], shadowOpacity: 0.16, shadowRadius: 20 },
  specimen: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  specimenName: { fontFamily: "Outfit_700Bold", fontSize: 12 },
  description: { lineHeight: 20, minHeight: 40, fontFamily: "Outfit_400Regular" },
});
