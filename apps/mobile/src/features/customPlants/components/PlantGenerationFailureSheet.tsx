import { Modal, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { AppButton } from "../../../components/AppButton";
import { useTheme } from "../../../providers/ThemeProvider";

export function PlantGenerationFailureSheet({
  visible,
  message,
  onClose,
}: {
  visible: boolean;
  message: string;
  onClose(): void;
}): React.JSX.Element {
  const theme = useTheme();
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
          <Text style={styles.eyebrow}>PLANT GOD</Text>
          <Text style={[styles.title, { color: theme.text }]}>Plant generation failed</Text>
          <Text style={[styles.copy, { color: theme.muted }]}>{message}</Text>
          <Text style={[styles.refund, { color: theme.text }]}>
            Your generation credit was refunded.
          </Text>
          <AppButton label="Return to Disco Plant" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(13,23,41,.68)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  sheet: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
  },
  eyebrow: { color: colors.purple, fontFamily: "Outfit_700Bold", letterSpacing: 1.5 },
  title: { fontSize: 28, fontFamily: "Outfit_700Bold", textAlign: "center" },
  copy: { textAlign: "center", lineHeight: 21 },
  refund: { fontFamily: "Outfit_700Bold", textAlign: "center" },
});
