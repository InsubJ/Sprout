import { AppButton } from "./AppButton";

interface Props {
  label: string;
  disabled?: boolean;
  onOpenCamera(): void;
  onCapture(uri: string): Promise<void> | void;
  onError(error: Error): void;
}

export function CameraOpenButton({ label, disabled, onOpenCamera }: Props): React.JSX.Element {
  return <AppButton label={label} tone="quiet" disabled={disabled} onPress={onOpenCamera} />;
}
