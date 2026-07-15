import type { ChangeEvent, CSSProperties } from "react";
import { StyleSheet, View } from "react-native";
import { AppButton } from "./AppButton";

interface CameraWebRuntime {
  isSecureContext?: boolean;
  navigator?: { mediaDevices?: { getUserMedia?: unknown } };
}

interface CameraFileInput {
  files?: ArrayLike<Blob>;
  value: string;
}

interface Props {
  label: string;
  disabled?: boolean;
  onOpenCamera(): void;
  onCapture(uri: string): Promise<void> | void;
  onError(error: Error): void;
}

const inputStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  opacity: 0,
  cursor: "pointer",
};

function supportsLiveCamera(): boolean {
  const runtime = globalThis as unknown as CameraWebRuntime;
  return (
    runtime.isSecureContext === true &&
    typeof runtime.navigator?.mediaDevices?.getUserMedia === "function"
  );
}

export function CameraOpenButton({
  label,
  disabled,
  onOpenCamera,
  onCapture,
  onError,
}: Props): React.JSX.Element {
  if (supportsLiveCamera())
    return <AppButton label={label} tone="quiet" disabled={disabled} onPress={onOpenCamera} />;

  const captureFile = (event: ChangeEvent<unknown>): void => {
    const input = event.currentTarget as unknown as CameraFileInput;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    const uri = URL.createObjectURL(file);
    void Promise.resolve(onCapture(uri)).catch((cause) =>
      onError(cause instanceof Error ? cause : new Error("The photo could not be captured")),
    );
  };

  return (
    <View style={styles.root}>
      <AppButton label={label} tone="quiet" disabled={disabled} style={styles.displayButton} />
      <input
        aria-label={label}
        type="file"
        accept="image/*"
        capture="environment"
        disabled={disabled}
        onChange={captureFile}
        style={inputStyle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: "relative" },
  displayButton: { pointerEvents: "none" },
});
