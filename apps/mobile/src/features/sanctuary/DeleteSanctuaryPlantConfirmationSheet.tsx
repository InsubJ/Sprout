import { StyleSheet, Text, View } from "react-native";
import type { PlantSpecies } from "@sprout/shared";
import { colors, spacing } from "@sprout/design-tokens";
import { AppButton } from "../../components/AppButton";
import { ModalSheet } from "../../components/ModalSheet";
import { useTheme } from "../../providers/ThemeProvider";
import { GeneratedPlantRenderer } from "../customPlants/components/GeneratedPlantRenderer";
import { normalizePlantSpecies } from "../plants/components/PlantRenderer";
import { nativePlantRegistry } from "../plants/plantRegistry";
import type { SanctuaryDeletionTarget } from "./useSanctuaryPlantDeletion";

export function DeleteSanctuaryPlantConfirmationSheet({
  target,
  deleting,
  error,
  onCancel,
  onConfirm,
}: {
  target: SanctuaryDeletionTarget | null;
  deleting: boolean;
  error: string | null;
  onCancel(): void;
  onConfirm(): void;
}): React.JSX.Element {
  const theme = useTheme();
  const name = target?.kind === "custom" ? target.plant.displayName : target?.habit.name;
  return (
    <ModalSheet visible={target !== null} onClose={onCancel}>
      {target ? (
        <View style={styles.content}>
          <Text style={[styles.eyebrow, theme.dark && styles.eyebrowDark]}>REMOVE PLANT</Text>
          <Text style={[styles.title, { color: theme.text }]}>Delete {name}?</Text>
          <View
            style={[styles.preview, { backgroundColor: theme.elevated, borderColor: theme.border }]}
          >
            <DeletionPreview target={target} />
          </View>
          <Text style={[styles.warning, { color: theme.text }]}>
            This permanently removes the plant and its saved history from your Sanctuary. It cannot
            be brought back.
          </Text>
          {error ? (
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <AppButton
              label={deleting ? "Deleting plant…" : "Delete permanently"}
              tone="danger"
              disabled={deleting}
              onPress={onConfirm}
            />
            <AppButton label="Keep plant" tone="quiet" disabled={deleting} onPress={onCancel} />
          </View>
        </View>
      ) : null}
    </ModalSheet>
  );
}

function DeletionPreview({ target }: { target: SanctuaryDeletionTarget }): React.JSX.Element {
  if (target.kind === "custom")
    return <GeneratedPlantRenderer spec={target.plant.plantSpec} size={210} state="completed" />;
  const species = normalizePlantSpecies(target.habit.plant_type);
  const Plant = nativePlantRegistry[species as PlantSpecies] ?? nativePlantRegistry.bonsai;
  return (
    <Plant
      currentWaterings={target.habit.target_waterings}
      targetWaterings={target.habit.target_waterings}
      witherCount={target.habit.wither_count}
      status="completed"
      size={210}
    />
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: "center", gap: spacing.lg, paddingBottom: spacing.xxl },
  eyebrow: {
    color: colors.danger,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 1.4,
    textAlign: "center",
  },
  eyebrowDark: { color: "#FF9C98" },
  title: { fontFamily: "Outfit_700Bold", fontSize: 28, textAlign: "center" },
  preview: {
    height: 230,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  warning: { fontSize: 16, lineHeight: 24, textAlign: "center" },
  error: { color: colors.danger, textAlign: "center", lineHeight: 20 },
  actions: { gap: spacing.md },
});
