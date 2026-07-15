import { Modal, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../../components/AppButton";
import { useTheme } from "../../providers/ThemeProvider";

interface FriendReturnDialogProps {
  visible: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function FriendReturnDialog({
  visible,
  onConfirm,
  onDismiss,
}: FriendReturnDialogProps): React.JSX.Element {
  const theme = useTheme();
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <View style={[styles.dialog, { backgroundColor: theme.surface }]}>
          <Text style={[styles.dialogTitle, { color: theme.text }]}>
            Leave your friend's garden?
          </Text>
          <Text style={{ color: theme.muted }}>
            You’re currently visiting a friend. Return to your own garden?
          </Text>
          <AppButton label="Leave garden" onPress={onConfirm} />
          <AppButton label="Keep visiting" tone="quiet" onPress={onDismiss} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,.6)", justifyContent: "center", padding: 24 },
  dialog: { borderRadius: 20, padding: 24, gap: 16 },
  dialogTitle: { fontSize: 22, fontFamily: "Outfit_700Bold" },
});
