import type { PropsWithChildren } from 'react'; import { Modal, StyleSheet, View } from 'react-native'; import { colors, spacing } from '@sprout/design-tokens';
export function ModalSheet({ visible, onClose, children }: PropsWithChildren<{ visible: boolean; onClose(): void }>) { return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}><View style={styles.content}>{children}</View></Modal>; }
const styles = StyleSheet.create({ content: { flex: 1, backgroundColor: colors.sand, padding: spacing.lg, paddingTop: spacing.xxl } });
