import type { PropsWithChildren } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { useTheme } from "../providers/ThemeProvider";
export function ModalSheet({
  visible,
  onClose,
  children,
}: PropsWithChildren<{ visible: boolean; onClose(): void }>) {
  const theme = useTheme();
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.content, { backgroundColor: theme.background }]}>{children}</View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  content: { flex: 1, backgroundColor: colors.sand, padding: spacing.lg, paddingTop: spacing.xxl },
});
