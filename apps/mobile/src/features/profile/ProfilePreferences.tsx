import { Alert, StyleSheet, Text, View } from "react-native";
import { spacing } from "@sprout/design-tokens";
import { PreferenceSwitchRow } from "../../components/PreferenceSwitchRow";
import { TextField } from "../../components/TextField";
import { useTheme } from "../../providers/ThemeProvider";

export function ProfilePreferences({
  displayName,
  username,
  darkMode,
  notifications,
  onDisplayNameChange,
  onDarkModeChange,
  onNotificationsChange,
}: {
  displayName: string;
  username: string;
  darkMode: boolean;
  notifications: boolean;
  onDisplayNameChange: (value: string) => void;
  onDarkModeChange: (value: boolean) => void;
  onNotificationsChange: (value: boolean) => Promise<void>;
}): React.JSX.Element {
  const theme = useTheme();
  return (
    <>
      <TextField label="Display name" value={displayName} onChangeText={onDisplayNameChange} />
      <PreferenceSwitchRow
        label="Dark mode"
        description="Use Sprout's nighttime garden palette"
        value={darkMode}
        onChange={onDarkModeChange}
      />
      <View style={styles.usernameGroup}>
        <TextField
          label="Username"
          value={username}
          editable={false}
          selectTextOnFocus
          autoCapitalize="none"
          accessibilityHint="Your username is permanent and cannot be edited"
        />
        <Text style={[styles.usernameNotice, { color: theme.muted }]}>
          Usernames are set when an account is created and cannot be changed afterward.
        </Text>
      </View>
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

const styles = StyleSheet.create({
  usernameGroup: { gap: spacing.xs },
  usernameNotice: { fontSize: 12, lineHeight: 17 },
});
