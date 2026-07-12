import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  getHabitProgress,
  getWateringAvailability,
  type Habit,
} from "@sprout/shared";
import { colors, radii, spacing } from "@sprout/design-tokens";
import { useTheme } from "../../../providers/ThemeProvider";
import {
  PlantRenderer,
  normalizePlantSpecies,
} from "../../plants/components/PlantRenderer";
import { plantDisplayName } from "../../plants/plantRegistry";
import { WateringButton } from "./WateringButton";
import { gardenCardGeometry } from "./gardenCardGeometry";
import { ProgressBar } from "../../../components/ProgressBar";
import { StreakIndicator } from "./StreakIndicator";
import { WaterLimitTooltip } from "./WaterLimitTooltip";

interface Props {
  habit: Habit;
  wateringsToday: number;
  watering: boolean;
  cardWidth?: number;
  viewerId?: string;
  onWater?(): void;
  onOpenReflections?(): void;
  onNudge?(): void;
  isNudged?: boolean;
  nudgeLoading?: boolean;
}
const frequencyLabels = {
  twice_daily: "Twice Daily",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
  flexible: "Flexible",
} as const;
const tierColors = {
  common: "#556B2F",
  uncommon: "#A0522D",
  rare: "#C71585",
  mythical: "#8B6508",
} as const;
const darkTierColors = {
  common: "#B5D477",
  uncommon: "#E7A67F",
  rare: "#FF91C8",
  mythical: "#FFD866",
} as const;
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
}: Props) {
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
  const progress = getHabitProgress(
    habit.current_waterings,
    habit.target_waterings,
  );
  const availability = getWateringAvailability(habit.frequency, wateringsToday);
  const owner = Boolean(onWater);
  const nameVisible =
    owner ||
    !habit.hide_name ||
    Boolean(viewerId && habit.share_name_friends?.includes(viewerId));
  const descriptionVisible =
    owner ||
    !habit.hide_description ||
    Boolean(viewerId && habit.share_desc_friends?.includes(viewerId));
  const hydrated = Math.max(
    0,
    habit.wither_threshold - habit.consecutive_misses,
  );
  const [tooltip, setTooltip] = useState(false);
  const [bookHovered, setBookHovered] = useState(false);
  const [cardHovered, setCardHovered] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const water = () => {
    if (availability.isLimitReached) {
      if (timer.current) clearTimeout(timer.current);
      setTooltip(true);
      timer.current = setTimeout(() => setTooltip(false), 3000);
      return;
    }
    onWater?.();
  };
  return (
    <View
      onPointerEnter={() => setCardHovered(true)}
      onPointerLeave={() => setCardHovered(false)}
      style={[
        styles.card,
        cardHovered && styles.cardHovered,
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
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text style={[styles.name, { color: theme.text }]}>
            {nameVisible ? habit.name : "Private Plant"}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.frequency, theme.dark && styles.frequencyDark]}>
              {frequencyLabels[habit.frequency]}
            </Text>
            <Text
              style={[
                styles.tier,
                { color: (theme.dark ? darkTierColors : tierColors)[habit.difficulty_tier] },
              ]}
            >
              {habit.difficulty_tier}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.status,
            habit.status === "withered"
              ? styles.statusWithered
              : habit.status === "completed"
                ? styles.statusCompleted
                : styles.statusHealthy,
            theme.dark && (habit.status === "withered"
              ? styles.statusWitheredDark
              : habit.status === "completed"
                ? styles.statusCompletedDark
                : styles.statusHealthyDark),
          ]}
        >
          {habit.status}
        </Text>
      </View>
      <View
        style={[
          styles.scene,
          { backgroundColor: theme.elevated, borderColor: theme.border },
        ]}
      >
        <PlantRenderer
          plantType={habit.plant_type}
          currentWaterings={habit.current_waterings}
          targetWaterings={habit.target_waterings}
          witherCount={habit.wither_count}
          status={habit.status}
          size={185}
        />
        {onOpenReflections ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Reflection Book"
            onHoverIn={() => setBookHovered(true)}
            onHoverOut={() => setBookHovered(false)}
            onPress={onOpenReflections}
            style={({ pressed }) => [styles.book, { backgroundColor: theme.surface, borderColor: theme.border }, bookHovered && styles.bookHovered, pressed && styles.bookPressed]}
          >
            <Text style={styles.bookText}>📖</Text>
          </Pressable>
        ) : null}
        {owner && habit.status !== "completed" ? (
          <View style={styles.water}>
            <WaterLimitTooltip visible={tooltip} />
            <WateringButton
              loading={watering}
              disabled={watering}
              visuallyDisabled={availability.isLimitReached}
              onPress={water}
            />
          </View>
        ) : null}
      </View>
      <View
        style={[
          styles.specimen,
          { backgroundColor: theme.elevated, borderColor: theme.border },
        ]}
      >
        <Text style={{ color: theme.muted }}>Plant Specimen:</Text>
        <Text style={[styles.specimenName, { color: theme.text }]}>
          {plantDisplayName(normalizePlantSpecies(habit.plant_type))}
        </Text>
      </View>
      {descriptionVisible ? (
        <Text
          numberOfLines={2}
          style={[styles.description, { color: theme.muted }]}
        >
          {habit.description || "A habit growing one act at a time."}
        </Text>
      ) : (
        <Text
          numberOfLines={2}
          style={[styles.description, { color: theme.muted }]}
        >
          Private description
        </Text>
      )}
      {habit.status !== "completed" ? (
        <View
          accessibilityLabel={`${hydrated} of ${habit.wither_threshold} hydration points`}
        >
          <Text style={[styles.sectionLabel, { color: theme.muted }]}>
            Hydration
          </Text>
          <View style={styles.dots}>
            {Array.from({ length: habit.wither_threshold }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index < hydrated ? styles.hydrated : styles.dehydrated,
                ]}
              />
            ))}
          </View>
        </View>
      ) : null}
      <View>
        <View style={styles.progressHeader}>
          <Text style={[styles.sectionLabel, { color: theme.text }]}>
            Growth Progress
          </Text>
          <Text style={{ color: theme.muted }}>
            {progress.current} / {progress.target} ({progress.percent}%)
          </Text>
        </View>
        <ProgressBar progress={progress.percent / 100} trackColor={theme.border} />
      </View>
      <View style={styles.footer}>
        <StreakIndicator streak={habit.current_streak} color={theme.text} />
        {habit.status === "withered" && onNudge ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isNudged ? "Nudge already sent today" : "Nudge this plant"
            }
            disabled={isNudged || nudgeLoading}
            onPress={onNudge}
            style={[
              styles.nudge,
              (isNudged || nudgeLoading) && styles.nudgeDisabled,
            ]}
          >
            <Text style={styles.nudgeText}>
              {nudgeLoading ? "Nudging…" : isNudged ? "Nudged" : "Nudge"}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    width: 326,
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    gap: 20,
    shadowColor: "#18321E",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    overflow: "hidden",
  },
  cardHovered: { transform: [{ translateY: -6 }], shadowOpacity: 0.16, shadowRadius: 20 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 16 },
  heading: { flex: 1, gap: 6 },
  name: { fontSize: 20, fontFamily: "Outfit_700Bold", lineHeight: 24 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  frequency: {
    fontSize: 12,
    fontFamily: "Outfit_700Bold",
    color: colors.forest,
    backgroundColor: "rgba(45,90,39,.08)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
  },
  frequencyDark: { color: "#9BCB8E", backgroundColor: "rgba(155,203,142,.14)" },
  tier: {
    fontSize: 12,
    fontFamily: "Outfit_700Bold",
    backgroundColor: "rgba(234,168,155,.18)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
    textTransform: "capitalize",
  },
  status: {
    fontSize: 12,
    fontFamily: "Outfit_700Bold",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
    textTransform: "capitalize",
    borderWidth: 1,
  },
  statusHealthy: {
    color: colors.forest,
    backgroundColor: "rgba(45,90,39,.12)",
    borderColor: "rgba(45,90,39,.15)",
  },
  statusHealthyDark: { color: "#9BCB8E", borderColor: "rgba(155,203,142,.35)" },
  statusWithered: {
    color: "#8B4513",
    backgroundColor: "rgba(139,69,19,.1)",
    borderColor: "rgba(139,69,19,.15)",
  },
  statusWitheredDark: { color: "#F2A594", borderColor: "rgba(242,165,148,.35)" },
  statusCompleted: {
    color: "#B22222",
    backgroundColor: "rgba(234,168,155,.2)",
    borderColor: "rgba(234,168,155,.3)",
  },
  statusCompletedDark: { color: "#F6C0B5", borderColor: "rgba(246,192,181,.4)" },
  scene: {
    minHeight: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: 8,
  },
  water: { position: "absolute", right: 12, bottom: 12 },
  book: {
    position: "absolute",
    left: 12,
    bottom: 12,
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bookHovered: { transform: [{ scale: 1.12 }], borderColor: colors.forest, shadowColor: colors.forest, shadowOpacity: 0.18, shadowRadius: 8 },
  bookPressed: { transform: [{ scale: 0.95 }] },
  bookText: { fontSize: 20 },
  specimen: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  specimenName: { fontFamily: "Outfit_700Bold", fontSize: 12 },
  description: { lineHeight: 20 },
  sectionLabel: { fontFamily: "Outfit_700Bold", fontSize: 13 },
  dots: { flexDirection: "row", gap: 7, marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  hydrated: {
    backgroundColor: "#4A90E2",
    shadowColor: "#4A90E2",
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  dehydrated: {
    backgroundColor: "#D3D3D3",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,.08)",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: colors.forest, borderRadius: 4 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  streak: { fontFamily: "Outfit_700Bold" },
  nudge: {
    backgroundColor: "#D97706",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  nudgeDisabled: { backgroundColor: "#E5E7EB" },
  nudgeText: { color: colors.paper, fontFamily: "Outfit_700Bold" },
});
