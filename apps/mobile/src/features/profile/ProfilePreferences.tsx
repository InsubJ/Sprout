import { Alert } from "react-native";
import { PreferenceSwitchRow } from "../../components/PreferenceSwitchRow";
import { TextField } from "../../components/TextField";
import { useTheme } from "../../providers/ThemeProvider";

export function ProfilePreferences({
  displayName,
  username,
  notifications,
  onDisplayNameChange,
  onUsernameChange,
  onNotificationsChange,
}: {
  displayName: string;
  username: string;
  notifications: boolean;
  onDisplayNameChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onNotificationsChange: (value: boolean) => Promise<void>;
}): React.JSX.Element {
  const theme = useTheme();
  return (
    <>
      <TextField label="Display name" value={displayName} onChangeText={onDisplayNameChange} />
      <PreferenceSwitchRow
        label="Dark mode"
        description="Use Sprout's nighttime garden palette"
        value={theme.dark}
        onChange={(value) => void theme.setDarkMode(value)}
      />
      <TextField
        label="Username"
        value={username}
        onChangeText={onUsernameChange}
        autoCapitalize="none"
      />
      <PreferenceSwitchRow
        label="Daily watering reminder"
        description="A gentle reminder at 7:00 pm"
        value={notifications}
        onChange={(value) =>
          void onNotificationsChange(value).catch((cause) =>
            Alert.alert(
              "Notifications unavailable",
              cause instanceof Error ? cause.message : "Try again",
            ),
          )
        }
      />
    </>
  );
}
