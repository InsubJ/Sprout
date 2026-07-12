import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { colors, radii, spacing } from "@sprout/design-tokens";
import type { Profile } from "@sprout/shared";
import { AppButton } from "../../components/AppButton";
import { AppSwitch } from "../../components/AppSwitch";
import { TextField } from "../../components/TextField";
import { useAuth } from "../../providers/AuthProvider";
import { useServices } from "../../providers/ServicesProvider";
import {
  getNotificationsEnabled,
  setNotificationsEnabled,
} from "../../services/notificationService";
import { useAppLock } from "../../providers/AppLockProvider";
import { useTheme } from "../../providers/ThemeProvider";
import { useRouter } from "expo-router";
export function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profiles, storage, isDemo } = useServices();
  const { biometricsEnabled, setBiometricsEnabled, pinEnabled, setPin } = useAppLock();
  const theme = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("Sprout Gardener");
  const [username, setUsername] = useState("gardener");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(false);
  const [pinEnabledInput, setPinEnabledInput] = useState(pinEnabled);
  const [pin, setPinValue] = useState("");
  const load = useCallback(async () => {
    if (!user) return;
    const loaded = profiles ? await profiles.getById(user.id) : null;
    if (loaded) {
      setProfile(loaded);
      setDisplayName(loaded.display_name ?? "");
      setUsername(loaded.username);
      setAvatar(loaded.avatar_url);
    }
  }, [profiles, user]);
  useEffect(() => {
    void load();
    void getNotificationsEnabled().then(setNotifications);
  }, [load]);
  useEffect(() => setPinEnabledInput(pinEnabled), [pinEnabled]);
  const chooseAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) throw new Error("Photo permission is required");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.72,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (storage && user)
      setAvatar(
        await storage.uploadReflection(user.id, {
          uri: asset.uri,
          mimeType: asset.mimeType,
          fileName: asset.fileName ?? "avatar.jpg",
          id: `avatar-${user.id}`,
        }),
      );
    else setAvatar(asset.uri);
  };
  const captureAvatar = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) throw new Error("Camera permission is required");
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.72 });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (storage && user) setAvatar(await storage.uploadReflection(user.id, { uri: asset.uri, mimeType: asset.mimeType, fileName: asset.fileName ?? "avatar-camera.jpg", id: `avatar-${user.id}-${Date.now()}` }));
    else setAvatar(asset.uri);
  };
  const save = async () => {
    if (username.trim().length < 3)
      throw new Error("Username must contain at least 3 characters");
    if (pinEnabledInput && !pinEnabled && !/^\d{4}$/.test(pin)) throw new Error("PIN must be exactly four digits");
    if (pinEnabledInput && pin) await setPin(pin); else if (!pinEnabledInput) await setPin(null);
    if (profiles && profile)
      await profiles.update({
        ...profile,
        username: username.trim(),
        display_name: displayName.trim() || null,
        avatar_url: avatar,
      });
    Alert.alert(
      "Profile saved",
      isDemo
        ? "Saved for this demo session."
        : "Your garden profile is up to date.",
    );
  };
  const toggleNotifications = async (enabled: boolean) => {
    await setNotificationsEnabled(enabled);
    setNotifications(enabled);
  };
  return (
    <ScrollView style={[styles.root, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.eyebrow, theme.dark && styles.eyebrowDark]}>YOUR GARDENER CARD</Text>
      <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
      {avatar ? (
        <Image source={avatar} style={styles.avatar} contentFit="cover" />
      ) : (
        <Text style={styles.fallback}>👤</Text>
      )}
      <AppButton
        label="Choose from photos"
        tone="quiet"
        onPress={() =>
          void chooseAvatar().catch((cause) =>
            Alert.alert(
              "Image failed",
              cause instanceof Error ? cause.message : "Try again",
            ),
          )
        }
      />
      <AppButton label="Open camera" tone="quiet" onPress={() => void captureAvatar().catch((cause) => Alert.alert("Camera failed", cause instanceof Error ? cause.message : "Try again"))} />
      {avatar ? <AppButton label="Remove avatar" tone="quiet" onPress={() => setAvatar(null)} /> : null}
      <TextField
        label="Display name"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <View style={[styles.preference, { backgroundColor: theme.surface }]}><View style={styles.preferenceText}><Text style={[styles.preferenceTitle, { color: theme.text }]}>Dark mode</Text><Text style={[styles.preferenceCaption, { color: theme.muted }]}>Use Sprout's nighttime garden palette</Text></View><AppSwitch accessibilityLabel="Dark mode" value={theme.dark} onValueChange={value => void theme.setDarkMode(value)} /></View>
      <TextField
        label="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <View style={[styles.preference, { backgroundColor: theme.surface }]}>
        <View style={styles.preferenceText}>
          <Text style={[styles.preferenceTitle, { color: theme.text }]}>Daily watering reminder</Text>
          <Text style={[styles.preferenceCaption, { color: theme.muted }]}>
            A gentle reminder at 7:00 pm
          </Text>
        </View>
        <AppSwitch
          accessibilityLabel="Daily watering reminder"
          value={notifications}
          onValueChange={(value) =>
            void toggleNotifications(value).catch((cause) =>
              Alert.alert(
                "Notifications unavailable",
                cause instanceof Error ? cause.message : "Try again",
              ),
            )
          }
        />
      </View>
      <View style={[styles.preference, { backgroundColor: theme.surface }]}><View style={styles.preferenceText}><Text style={[styles.preferenceTitle, { color: theme.text }]}>PIN security lock</Text><Text style={[styles.preferenceCaption, { color: theme.muted }]}>Use a four-digit fallback code</Text></View><AppSwitch accessibilityLabel="PIN security lock" value={pinEnabledInput} onValueChange={setPinEnabledInput} /></View>
      {pinEnabledInput ? <TextField label="Four-digit PIN" value={pin} onChangeText={value => setPinValue(value.replace(/\D/g, '').slice(0, 4))} secureTextEntry keyboardType="number-pad" /> : null}
      <View style={[styles.preference, { backgroundColor: theme.surface }]}>
        <View style={styles.preferenceText}>
          <Text style={[styles.preferenceTitle, { color: theme.text }]}>Biometric app lock</Text>
          <Text style={[styles.preferenceCaption, { color: theme.muted }]}>
            Require Face ID or device authentication
          </Text>
        </View>
        <AppSwitch
          accessibilityLabel="Biometric app lock"
          value={biometricsEnabled}
          onValueChange={(value) =>
            void setBiometricsEnabled(value).catch((cause) =>
              Alert.alert(
                "App lock unavailable",
                cause instanceof Error ? cause.message : "Try again",
              ),
            )
          }
        />
      </View>
      <AppButton
        label="Save profile"
        onPress={() =>
          void save().catch((cause) =>
            Alert.alert(
              "Save failed",
              cause instanceof Error ? cause.message : "Try again",
            ),
          )
        }
      />
      <AppButton label="View Sprout Wrapped" tone="quiet" onPress={() => router.push("/(tabs)/wrapped")} />
      <AppButton label="Sign out" tone="quiet" onPress={() => void signOut()} />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  content: { padding: spacing.lg, paddingTop: spacing.xl, gap: spacing.md },
  eyebrow: {
    color: colors.forest,
    fontSize: 12,
    fontFamily: "Outfit_700Bold",
    letterSpacing: 1.5,
  },
  eyebrowDark: { color: "#9BCB8E" },
  title: { color: colors.ink, fontSize: 32, fontFamily: "Outfit_700Bold" },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignSelf: "center",
    backgroundColor: colors.leaf,
  },
  fallback: {
    fontSize: 74,
    textAlign: "center",
    backgroundColor: colors.leaf,
    borderRadius: radii.pill,
    overflow: "hidden",
    alignSelf: "center",
    padding: spacing.md,
  },
  preference: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  preferenceText: { flex: 1 },
  preferenceTitle: { color: colors.ink, fontFamily: "Outfit_700Bold" },
  preferenceCaption: { color: colors.muted, fontSize: 12 },
});
