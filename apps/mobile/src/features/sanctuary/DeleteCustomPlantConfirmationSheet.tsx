import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import type { CustomPlant } from "@sprout/shared";
import { AppButton } from "../../components/AppButton";
import { ModalSheet } from "../../components/ModalSheet";
import { useTheme } from "../../providers/ThemeProvider";
import { GeneratedPlantRenderer } from "../customPlants/components/GeneratedPlantRenderer";

export function DeleteCustomPlantConfirmationSheet({
  plant,
  deleting,
  error,
  onCancel,
  onConfirm,
}: {
  plant: CustomPlant | null;
  deleting: boolean;
  error: string | null;
  onCancel(): void;
  onConfirm(): void;
}): React.JSX.Element {
  const theme = useTheme();
  return (
    <ModalSheet visible={plant !== null} onClose={onCancel}>
      {plant ? (
        <View style={styles.content}>
          <Text style={[styles.eyebrow, theme.dark && styles.eyebrowDark]}>REMOVE PLANT</Text>
          <Text style={[styles.title, { color: theme.text }]}>Delete {plant.displayName}?</Text>
          <View
            style={[styles.preview, { backgroundColor: theme.elevated, borderColor: theme.border }]}
          >
            <GeneratedPlantRenderer spec={plant.plantSpec} size={210} state="completed" />
          </View>
          <Text style={[styles.warning, { color: theme.text }]}>
            This permanently removes the plant from your Sanctuary. It cannot be brought back.
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
