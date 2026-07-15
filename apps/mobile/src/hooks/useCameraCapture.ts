import { useCallback, useEffect, useRef, useState } from "react";
import { CameraView, useCameraPermissions, type CameraType } from "expo-camera";

interface CameraCaptureOptions {
  visible: boolean;
  onCapture(uri: string): Promise<void> | void;
  onClose(): void;
}

export interface CameraCaptureState {
  cameraRef: React.RefObject<CameraView | null>;
  permissionGranted: boolean;
  permissionResolved: boolean;
  facing: CameraType;
  capturing: boolean;
  error: string | null;
  requestPermission(): Promise<void>;
  toggleFacing(): void;
  capture(): Promise<void>;
  reportMountError(message: string): void;
}

export function useCameraCapture({
  visible,
  onCapture,
  onClose,
}: CameraCaptureOptions): CameraCaptureState {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestCameraPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await requestCameraPermission();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Camera permission could not be requested");
    }
  }, [requestCameraPermission]);

  useEffect(() => {
    if (!visible) {
      setError(null);
      return;
    }
    if (!permission) void requestPermission();
  }, [permission, requestPermission, visible]);

  const capture = async (): Promise<void> => {
    if (capturing) return;
    if (!permission?.granted) {
      setError("Camera permission is required before taking a photo.");
      return;
    }
    if (!cameraRef.current) {
      setError("The camera is still starting. Please try again.");
      return;
    }
    setCapturing(true);
    setError(null);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo?.uri) throw new Error("The camera did not return a photo");
      await onCapture(photo.uri);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The photo could not be captured");
    } finally {
      setCapturing(false);
    }
  };

  return {
    cameraRef,
    permissionGranted: Boolean(permission?.granted),
    permissionResolved: permission !== null,
    facing,
    capturing,
    error,
    requestPermission,
    toggleFacing: () => setFacing((current) => (current === "back" ? "front" : "back")),
    capture,
    reportMountError: setError,
  };
}
