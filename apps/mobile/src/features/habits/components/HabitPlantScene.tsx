import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getWateringAvailability, type Habit } from "@sprout/shared";
import { useTheme } from "../../../providers/ThemeProvider";
import { PlantRenderer } from "../../plants/components/PlantRenderer";
import { WateringButton } from "./WateringButton";
import { WaterLimitTooltip } from "./WaterLimitTooltip";
import { gardenCardGeometry } from "./gardenCardGeometry";

export function HabitPlantScene({
  habit,
  wateringsToday,
  watering,
  owner,
  onWater,
  onOpenReflections,
}: {
  habit: Habit;
  wateringsToday: number;
  watering: boolean;
  owner: boolean;
  onWater?: () => void;
  onOpenReflections?: () => void;
}): React.JSX.Element {
  const theme = useTheme();
  const availability = getWateringAvailability(habit.frequency, wateringsToday);
  const [tooltip, setTooltip] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const water = (): void => {
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
      style={[
        styles.scene,
        {
          height: gardenCardGeometry.sceneHeight,
          backgroundColor: theme.elevated,
          borderColor: theme.border,
        },
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
          onPress={onOpenReflections}
          style={({ pressed }) => [
            styles.book,
            { backgroundColor: theme.surface, borderColor: theme.border },
            pressed && styles.pressed,
          ]}
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
  );
}
const styles = StyleSheet.create({
  scene: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  book: {
    position: "absolute",
    left: 12,
    bottom: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { transform: [{ scale: 0.94 }], opacity: 0.8 },
  bookText: { fontSize: 21 },
  water: { position: "absolute", right: 12, bottom: 12 },
});
