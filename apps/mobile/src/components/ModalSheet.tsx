import type { PropsWithChildren } from "react";
import { Modal, StyleSheet } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { useTheme } from "../providers/ThemeProvider";
import { SafeAreaModalView } from "./SafeAreaModalView";
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
      <SafeAreaModalView
        style={[styles.content, { backgroundColor: theme.background }]}
        minimumTopPadding={spacing.xxl}
      >
        {children}
      </SafeAreaModalView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  content: { flex: 1, backgroundColor: colors.sand, paddingHorizontal: spacing.lg },
});
