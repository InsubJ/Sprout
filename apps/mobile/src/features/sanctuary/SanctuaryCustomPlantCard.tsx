import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { spacing } from "@sprout/design-tokens";
import type { CustomPlant } from "@sprout/shared";
import { AppButton } from "../../components/AppButton";
import { useTheme } from "../../providers/ThemeProvider";
import { GeneratedPlantRenderer } from "../customPlants/components/GeneratedPlantRenderer";
import { gardenCardGeometry } from "../habits/components/gardenCardGeometry";
import { CustomPlantDetailsSheet } from "./CustomPlantDetailsSheet";
import { HoldToRevealDeleteCard } from "./HoldToRevealDeleteCard";

export function SanctuaryCustomPlantCard({
  plant,
  width,
  onRequestDelete,
}: {
  plant: CustomPlant;
  width: number;
  onRequestDelete?(plant: CustomPlant): void;
}): React.JSX.Element {
  const theme = useTheme();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const requestDeletion = (): void => onRequestDelete?.(plant);
  const cardStyle = [
    styles.card,
    {
      width,
      backgroundColor: theme.surface,
      borderColor: theme.dark ? "#7D5A91" : "#B49AC8",
    },
  ];
  const content = (
    <View style={[styles.cardContent, { backgroundColor: theme.surface }]}>
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
    </View>
  );

  return (
    <>
      {onRequestDelete ? (
        <HoldToRevealDeleteCard
          plantName={plant.displayName}
          style={cardStyle}
          onRequestDelete={requestDeletion}
        >
          {content}
        </HoldToRevealDeleteCard>
      ) : (
        <View style={cardStyle}>{content}</View>
      )}
      <CustomPlantDetailsSheet
        plant={plant}
        visible={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onRequestDelete={
          onRequestDelete
            ? () => {
                setDetailsOpen(false);
                requestDeletion();
              }
            : undefined
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: gardenCardGeometry.height,
    borderRadius: 20,
    borderWidth: 2,
    overflow: "hidden",
  },
  cardContent: {
    flex: 1,
    minHeight: gardenCardGeometry.height - 4,
    padding: spacing.lg,
    gap: 12,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flex: 1, fontFamily: "Outfit_700Bold", fontSize: 22 },
  badge: {
    color: "#FFFFFF",
    backgroundColor: "#7C4D9E",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontFamily: "Outfit_700Bold",
    overflow: "hidden",
  },
  scene: { height: 185, alignItems: "center", justifyContent: "center", borderRadius: 14 },
  description: { lineHeight: 20, flexShrink: 1 },
  prompt: { fontStyle: "italic", lineHeight: 19 },
  date: { fontSize: 12 },
});
