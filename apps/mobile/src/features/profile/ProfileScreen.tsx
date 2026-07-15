import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { colors, spacing } from "@sprout/design-tokens";
import { useRouter } from "expo-router";
import { AppButton } from "../../components/AppButton";
import { ResponsivePageContent } from "../../components/ResponsivePageContent";
import { useAuth } from "../../providers/AuthProvider";
import { useAppLock } from "../../providers/AppLockProvider";
import { useIsDemoMode } from "../../providers/ServicesProvider";
import { useTheme } from "../../providers/ThemeProvider";
import {
  getNotificationsEnabled,
  setNotificationsEnabled,
} from "../../services/notificationService";
import { AvatarEditor } from "./AvatarEditor";
import { ProfilePreferences } from "./ProfilePreferences";
import { ProfileSaveConfirmation } from "./ProfileSaveConfirmation";
import { SecurityPreferences } from "./SecurityPreferences";
import { useProfileEditor } from "./useProfileEditor";
import { useProfileSaveConfirmation } from "./useProfileSaveConfirmation";

export function ProfileScreen(): React.JSX.Element {
  const router = useRouter();
  const { signOut } = useAuth();
  const isDemo = useIsDemoMode();
  const lock = useAppLock();
  const theme = useTheme();
  const editor = useProfileEditor();
  const confirmation = useProfileSaveConfirmation();
  const [notifications, setNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(theme.dark);
  const [pinEnabled, setPinEnabled] = useState(lock.pinEnabled);
  const [pin, setPin] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    void getNotificationsEnabled().then(setNotifications);
  }, []);
  useEffect(() => setPinEnabled(lock.pinEnabled), [lock.pinEnabled]);
  useEffect(() => setDarkMode(theme.dark), [theme.dark]);
  const toggleNotifications = async (enabled: boolean): Promise<void> => {
    await setNotificationsEnabled(enabled);
    setNotifications(enabled);
  };
  const save = async (): Promise<void> => {
    if (saving) return;
    if (pinEnabled && !lock.pinEnabled && !/^\d{4}$/.test(pin))
      throw new Error("PIN must be exactly four digits");
    setSaving(true);
    try {
      if (pinEnabled && pin) await lock.setPin(pin);
      else if (!pinEnabled) await lock.setPin(null);
      await editor.save();
      await theme.setDarkMode(darkMode);
      confirmation.show();
    } finally {
      setSaving(false);
    }
  };
  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <ResponsivePageContent style={styles.content}>
        <Text style={[styles.eyebrow, theme.dark && styles.dark]}>YOUR GARDENER CARD</Text>
        <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
        <AvatarEditor avatar={editor.avatar} onChange={editor.setAvatar} />
        <ProfilePreferences
          displayName={editor.displayName}
          username={editor.username}
          darkMode={darkMode}
          notifications={notifications}
          onDisplayNameChange={editor.setDisplayName}
          onDarkModeChange={setDarkMode}
          onNotificationsChange={toggleNotifications}
        />
        <SecurityPreferences
          pinEnabled={pinEnabled}
          pin={pin}
          biometricsEnabled={lock.biometricsEnabled}
          onPinEnabledChange={setPinEnabled}
          onPinChange={setPin}
          onBiometricsChange={lock.setBiometricsEnabled}
        />
        <AppButton
          label={saving ? "Saving changes…" : "Save changes"}
          disabled={saving}
          onPress={() =>
            void save().catch((cause) =>
              Alert.alert("Save failed", cause instanceof Error ? cause.message : "Try again"),
            )
          }
        />
        <AppButton
          label="View Sprout Wrapped"
          tone="quiet"
          onPress={() => router.push("/(tabs)/wrapped")}
        />
        <AppButton label="Sign out" tone="quiet" onPress={() => void signOut()} />
        <ProfileSaveConfirmation
          visible={confirmation.visible}
          message={isDemo ? "Saved for this demo session." : "Your garden profile is up to date."}
          onDismiss={confirmation.hide}
        />
      </ResponsivePageContent>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  scrollContent: { alignItems: "center" },
  content: { padding: spacing.lg, paddingTop: spacing.xl, gap: spacing.md },
  eyebrow: { color: colors.forest, fontSize: 12, fontFamily: "Outfit_700Bold", letterSpacing: 1.5 },
  dark: { color: "#9BCB8E" },
  title: { fontSize: 32, fontFamily: "Outfit_700Bold" },
});
