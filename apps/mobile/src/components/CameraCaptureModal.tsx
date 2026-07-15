import { useNativeCameraLauncher } from "../hooks/useNativeCameraLauncher";

interface Props {
  visible: boolean;
  onCapture(uri: string): Promise<void> | void;
  onClose(): void;
  onError(error: Error): void;
}

export function CameraCaptureModal({ visible, onCapture, onClose, onError }: Props): null {
  useNativeCameraLauncher({ visible, onCapture, onClose, onError });
  return null;
}
