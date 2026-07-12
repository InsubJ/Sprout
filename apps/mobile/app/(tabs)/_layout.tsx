import { useState } from "react";
import { Redirect, Tabs, usePathname, useRouter } from "expo-router";
import { Modal, StyleSheet, Text, View } from "react-native";
import { colors } from "@sprout/design-tokens";
import { AppButton } from "../../src/components/AppButton";
import { LockScreen } from "../../src/features/auth/LockScreen";
import { useAuth } from "../../src/providers/AuthProvider";
import { useAppLock } from "../../src/providers/AppLockProvider";
import { useTheme } from "../../src/providers/ThemeProvider";

const Icon = ({ value }: { value: string }) => <Text accessible={false} importantForAccessibility="no" style={{ fontSize: 20 }}>{value}</Text>;

export default function TabsLayout() {
  const { user, loading } = useAuth();
  const { locked, checking } = useAppLock();
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [confirmHome, setConfirmHome] = useState(false);
  const visitingFriend = pathname.startsWith("/friend-forest/") || pathname.startsWith("/friend-sanctuary/");
  if (!loading && !user) return <Redirect href="/(auth)/login" />;
  if (checking) return null;
  if (locked) return <LockScreen />;
  return <>
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: theme.dark ? "#9BCB8E" : colors.forest, tabBarInactiveTintColor: theme.muted, sceneStyle: { backgroundColor: theme.background }, tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 6, backgroundColor: theme.surface, borderTopColor: theme.border } }}>
      <Tabs.Screen name="forest" options={{ title: "Forest", tabBarAccessibilityLabel: "Forest tab", tabBarIcon: () => <Icon value="🌲" /> }} listeners={{ tabPress: event => { if (visitingFriend) { event.preventDefault(); setConfirmHome(true); } } }} />
      <Tabs.Screen name="sanctuary" options={{ title: "Sanctuary", tabBarAccessibilityLabel: "Sanctuary tab", tabBarIcon: () => <Icon value="🏡" /> }} />
      <Tabs.Screen name="buds" options={{ title: "Buds", tabBarAccessibilityLabel: "Buds tab", tabBarIcon: () => <Icon value="🌿" /> }} />
      <Tabs.Screen name="lab" options={{ title: "Lab", tabBarAccessibilityLabel: "Lab tab", tabBarIcon: () => <Icon value="🧪" /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarAccessibilityLabel: "Profile tab", tabBarIcon: () => <Icon value="👤" /> }} />
      <Tabs.Screen name="friend-forest/[id]" options={{ href: null }} />
      <Tabs.Screen name="friend-sanctuary/[id]" options={{ href: null }} />
      <Tabs.Screen name="wrapped" options={{ href: null }} />
    </Tabs>
    <Modal transparent visible={confirmHome} animationType="fade" onRequestClose={() => setConfirmHome(false)}>
      <View style={styles.backdrop}><View style={[styles.dialog, { backgroundColor: theme.surface }]}><Text style={[styles.dialogTitle, { color: theme.text }]}>Return to your forest?</Text><Text style={{ color: theme.muted }}>You’re currently visiting a friend. Return home to your own forest?</Text><AppButton label="Return home" onPress={() => { setConfirmHome(false); router.replace("/(tabs)/forest"); }} /><AppButton label="Keep visiting" tone="quiet" onPress={() => setConfirmHome(false)} /></View></View>
    </Modal>
  </>;
}

const styles = StyleSheet.create({ backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,.6)", justifyContent: "center", padding: 24 }, dialog: { borderRadius: 20, padding: 24, gap: 16 }, dialogTitle: { fontSize: 22, fontFamily: "Outfit_700Bold" } });
