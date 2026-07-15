import { useEffect, useRef } from "react";
import * as ImagePicker from "expo-image-picker";

interface NativeCameraLauncherOptions {
  visible: boolean;
  onCapture(uri: string): Promise<void> | void;
  onClose(): void;
  onError(error: Error): void;
}

export function useNativeCameraLauncher({
  visible,
  onCapture,
  onClose,
  onError,
}: NativeCameraLauncherOptions): void {
  const launched = useRef(false);
  const callbacks = useRef({ onCapture, onClose, onError });
  useEffect(() => {
    callbacks.current = { onCapture, onClose, onError };
  }, [onCapture, onClose, onError]);
  useEffect(() => {
    if (!visible) {
      launched.current = false;
      return;
    }
    if (launched.current) return;
    launched.current = true;
    let active = true;
    void (async () => {
      try {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) throw new Error("Camera permission is required");
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.8,
        });
        const uri = result.canceled ? null : result.assets[0]?.uri;
        if (active && uri) await callbacks.current.onCapture(uri);
      } catch (cause) {
        if (active)
          callbacks.current.onError(
            cause instanceof Error ? cause : new Error("The camera could not be opened"),
          );
      } finally {
        if (active) callbacks.current.onClose();
      }
    })();
    return () => {
      active = false;
    };
  }, [visible]);
}
