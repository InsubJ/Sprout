import { Alert } from "react-native";
import { PreferenceSwitchRow } from "../../components/PreferenceSwitchRow";
import { TextField } from "../../components/TextField";

export function SecurityPreferences({
  pinEnabled,
  pin,
  biometricsEnabled,
  onPinEnabledChange,
  onPinChange,
  onBiometricsChange,
}: {
  pinEnabled: boolean;
  pin: string;
  biometricsEnabled: boolean;
  onPinEnabledChange: (value: boolean) => void;
  onPinChange: (value: string) => void;
  onBiometricsChange: (value: boolean) => Promise<void>;
}): React.JSX.Element {
  return (
    <>
      <PreferenceSwitchRow
        label="PIN security lock"
        description="Use a four-digit fallback code"
        value={pinEnabled}
        onChange={onPinEnabledChange}
      />
      {pinEnabled ? (
        <TextField
          label="Four-digit PIN"
          value={pin}
          onChangeText={(value) => onPinChange(value.replace(/\D/g, "").slice(0, 4))}
          secureTextEntry
          keyboardType="number-pad"
        />
      ) : null}
      <PreferenceSwitchRow
        label="Biometric app lock"
        description="Require Face ID or device authentication"
        value={biometricsEnabled}
        onChange={(value) =>
          void onBiometricsChange(value).catch((cause) =>
            Alert.alert(
              "App lock unavailable",
              cause instanceof Error ? cause.message : "Try again",
            ),
          )
        }
      />
    </>
  );
}
