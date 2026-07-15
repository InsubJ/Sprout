import { Modal, StyleSheet, Text, View } from "react-native";
import { CameraView } from "expo-camera";
import { colors, radii, spacing } from "@sprout/design-tokens";
import { useCameraCapture } from "../hooks/useCameraCapture";
import { useTheme } from "../providers/ThemeProvider";
import { AppButton } from "./AppButton";

interface Props {
  visible: boolean;
  onCapture(uri: string): Promise<void> | void;
  onClose(): void;
  onError(error: Error): void;
}

export function CameraCaptureModal({ visible, onCapture, onClose }: Props): React.JSX.Element {
  const theme = useTheme();
  const camera = useCameraCapture({ visible, onCapture, onClose });
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={camera.capturing ? undefined : onClose}
    >
      <View style={[styles.root, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>Take a photo</Text>
        {!camera.permissionResolved ? (
          <Text style={[styles.message, { color: theme.muted }]}>Opening the camera…</Text>
        ) : !camera.permissionGranted ? (
          <View style={[styles.permissionCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.message, { color: theme.text }]}>Camera access is needed.</Text>
            <Text style={[styles.detail, { color: theme.muted }]}>
              Allow access to take a photo without leaving Sprout.
            </Text>
            <AppButton label="Allow camera" onPress={() => void camera.requestPermission()} />
          </View>
        ) : visible ? (
          <CameraView
            ref={camera.cameraRef}
            active={visible}
            facing={camera.facing}
            mode="picture"
            style={styles.camera}
            onMountError={(event) => camera.reportMountError(event.message)}
          />
        ) : null}
        {camera.error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {camera.error}
          </Text>
        ) : null}
        <View style={styles.controls}>
          {camera.permissionGranted ? (
            <AppButton
              label="Flip camera"
              tone="quiet"
              disabled={camera.capturing}
              onPress={camera.toggleFacing}
            />
          ) : null}
          {camera.permissionGranted ? (
            <AppButton
              label={camera.capturing ? "Saving photo…" : "Take photo"}
              disabled={camera.capturing}
              onPress={() => void camera.capture()}
            />
          ) : null}
          <AppButton label="Cancel" tone="quiet" disabled={camera.capturing} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: spacing.lg, paddingTop: spacing.xxl, gap: spacing.md },
  title: { fontFamily: "Outfit_700Bold", fontSize: 28 },
  camera: { flex: 1, minHeight: 320, borderRadius: radii.lg, overflow: "hidden" },
  permissionCard: { padding: spacing.lg, borderRadius: radii.lg, gap: spacing.md },
  message: { textAlign: "center", fontFamily: "Outfit_600SemiBold", fontSize: 18 },
  detail: { textAlign: "center", lineHeight: 22 },
  error: { color: colors.danger, textAlign: "center", fontFamily: "Outfit_600SemiBold" },
  controls: { gap: spacing.sm },
});
