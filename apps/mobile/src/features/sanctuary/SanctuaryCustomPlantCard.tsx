import { useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import type { CustomPlant } from "@sprout/shared";
import { AppButton } from "../../components/AppButton";
import { useTheme } from "../../providers/ThemeProvider";
import { GeneratedPlantRenderer } from "../customPlants/components/GeneratedPlantRenderer";
import { gardenCardGeometry } from "../habits/components/gardenCardGeometry";
import { CustomPlantDetailsSheet } from "./CustomPlantDetailsSheet";
import { TrashCanIcon } from "./TrashCanIcon";
import { swipeUpActionRevealHeight, useSwipeUpActionReveal } from "./useSwipeUpActionReveal";

export function SanctuaryCustomPlantCard({
  plant,
  width,
  onRequestDelete,
}: {
  plant: CustomPlant;
  width: number;
  onRequestDelete(plant: CustomPlant): void;
}) {
  const theme = useTheme();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const swipeAction = useSwipeUpActionReveal();
  const requestDeletion = (): void => {
    swipeAction.hide();
    onRequestDelete(plant);
  };

  return (
    <>
      <View
        {...swipeAction.panHandlers}
        style={[
          styles.card,
          {
            width,
            backgroundColor: theme.surface,
            borderColor: theme.dark ? "#7D5A91" : "#B49AC8",
          },
        ]}
      >
        <View
          accessibilityElementsHidden={!swipeAction.revealed}
          importantForAccessibility={swipeAction.revealed ? "yes" : "no-hide-descendants"}
          pointerEvents={swipeAction.revealed ? "auto" : "none"}
          style={styles.deleteTray}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete ${plant.displayName} from Sanctuary`}
            onPress={requestDeletion}
            style={({ pressed }) => [styles.trashButton, pressed && styles.trashButtonPressed]}
          >
            <TrashCanIcon color={colors.paper} size={25} />
            <Text style={styles.deleteLabel}>Delete plant</Text>
          </Pressable>
        </View>

        <Animated.View
          style={[
            styles.cardContent,
            {
              backgroundColor: theme.surface,
              transform: [{ translateY: swipeAction.contentTranslateY }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text numberOfLines={1} style={[styles.title, { color: theme.text }]}>
              {plant.displayName}
            </Text>
            <Text style={styles.badge}>custom</Text>
          </View>
          <View style={[styles.scene, { backgroundColor: theme.dark ? "#211B2D" : "#F3EDF7" }]}>
            <GeneratedPlantRenderer spec={plant.plantSpec} size={230} state="completed" />
          </View>
          <Text numberOfLines={3} style={[styles.description, { color: theme.text }]}>
            {plant.description}
          </Text>
          <Text numberOfLines={2} style={[styles.prompt, { color: theme.muted }]}>
            “{plant.originalPrompt}”
          </Text>
          <Text style={[styles.date, { color: theme.muted }]}>
            Created {new Date(plant.createdAt).toLocaleDateString()}
          </Text>
          <AppButton tone="quiet" label="Show more" onPress={() => setDetailsOpen(true)} />
        </Animated.View>
      </View>
      <CustomPlantDetailsSheet
        plant={plant}
        visible={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onRequestDelete={() => {
          setDetailsOpen(false);
          requestDeletion();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    height: gardenCardGeometry.height,
    borderRadius: 20,
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderColor: "#B49AC8",
    overflow: "hidden",
  },
  cardContent: { flex: 1, padding: spacing.lg, gap: 12 },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flex: 1, fontFamily: "Outfit_700Bold", fontSize: 22, color: colors.ink },
  badge: {
    color: colors.paper,
    backgroundColor: colors.purple,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontFamily: "Outfit_700Bold",
    overflow: "hidden",
  },
  scene: {
    height: 185,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3EDF7",
    borderRadius: 14,
  },
  description: { color: colors.ink, lineHeight: 20, flexShrink: 1 },
  prompt: { color: colors.muted, fontStyle: "italic", lineHeight: 19 },
  date: { color: colors.muted, fontSize: 12 },
  deleteTray: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    height: swipeUpActionRevealHeight,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  trashButton: {
    minWidth: 150,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: 16,
  },
  trashButtonPressed: { backgroundColor: "rgba(255,255,255,0.14)" },
  deleteLabel: { color: colors.paper, fontFamily: "Outfit_700Bold", fontSize: 16 },
});
