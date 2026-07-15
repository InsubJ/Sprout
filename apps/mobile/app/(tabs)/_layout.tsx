import { Redirect, Tabs, usePathname, useRouter } from "expo-router";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@sprout/design-tokens";
import { LockScreen } from "../../src/features/auth/LockScreen";
import { TabBarPressable } from "../../src/components/TabBarPressable";
import { FriendReturnDialog } from "../../src/features/social/FriendReturnDialog";
import { useFriendGardenTabGuard } from "../../src/features/social/useFriendGardenTabGuard";
import { useUsernameOnboarding } from "../../src/features/auth/useUsernameOnboarding";
import { useAuth } from "../../src/providers/AuthProvider";
import { useAppLock } from "../../src/providers/AppLockProvider";
import { useTheme } from "../../src/providers/ThemeProvider";

const Icon = ({ value }: { value: string }): React.JSX.Element => (
  <Text accessible={false} importantForAccessibility="no" style={{ fontSize: 20 }}>
    {value}
  </Text>
);

export default function TabsLayout(): React.JSX.Element | null {
  const { user, loading } = useAuth();
  const usernameOnboarding = useUsernameOnboarding();
  const { locked, checking } = useAppLock();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const visitingFriend =
    pathname.startsWith("/friend-forest/") || pathname.startsWith("/friend-sanctuary/");
  const friendGardenGuard = useFriendGardenTabGuard(visitingFriend, (destination) =>
    router.replace(destination),
  );
  if (!loading && !user) return <Redirect href="/(auth)/login" />;
  if (!loading && user && usernameOnboarding.status === "loading") return null;
  if (
    !loading &&
    user &&
    (usernameOnboarding.status === "required" || usernameOnboarding.status === "error")
  )
    return <Redirect href="/(auth)/choose-username" />;
  if (checking) return null;
  if (locked) return <LockScreen />;
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.dark ? "#9BCB8E" : colors.forest,
          tabBarInactiveTintColor: theme.muted,
          tabBarButton: ({
            children,
            style,
            onPress,
            onLongPress,
            accessibilityState,
            accessibilityLabel,
            testID,
          }) => (
            <TabBarPressable
              containerStyle={style}
              accessibilityRole="button"
              accessibilityState={accessibilityState}
              accessibilityLabel={accessibilityLabel}
              testID={testID}
              onLongPress={onLongPress}
              onPress={(event) => onPress?.(event)}
            >
              {children}
            </TabBarPressable>
          ),
          sceneStyle: { backgroundColor: theme.background },
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            height: 56 + Math.max(insets.bottom, 8),
            paddingBottom: Math.max(insets.bottom, 8),
            paddingTop: 6,
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
          },
        }}
      >
        <Tabs.Screen
          name="forest"
          options={{
            title: "Forest",
            tabBarAccessibilityLabel: "Forest tab",
            tabBarIcon: () => <Icon value="🌲" />,
          }}
          listeners={{
            tabPress: friendGardenGuard.guardTabPress("forest"),
          }}
        />
        <Tabs.Screen
          name="sanctuary"
          options={{
            title: "Sanctuary",
            tabBarAccessibilityLabel: "Sanctuary tab",
            tabBarIcon: () => <Icon value="🏡" />,
          }}
          listeners={{
            tabPress: friendGardenGuard.guardTabPress("sanctuary"),
          }}
        />
        <Tabs.Screen
          name="buds"
          options={{
            title: "Buds",
            tabBarAccessibilityLabel: "Buds tab",
            tabBarIcon: () => <Icon value="🌿" />,
          }}
          listeners={{
            tabPress: friendGardenGuard.guardTabPress("buds"),
          }}
        />
        <Tabs.Screen
          name="lab"
          options={{
            title: "Lab",
            tabBarAccessibilityLabel: "Lab tab",
            tabBarIcon: () => <Icon value="🧪" />,
          }}
          listeners={{
            tabPress: friendGardenGuard.guardTabPress("lab"),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarAccessibilityLabel: "Profile tab",
            tabBarIcon: () => <Icon value="👤" />,
          }}
          listeners={{
            tabPress: friendGardenGuard.guardTabPress("profile"),
          }}
        />
        <Tabs.Screen name="friend-forest/[id]" options={{ href: null }} />
        <Tabs.Screen name="friend-sanctuary/[id]" options={{ href: null }} />
        <Tabs.Screen name="wrapped" options={{ href: null }} />
      </Tabs>
      <FriendReturnDialog
        visible={friendGardenGuard.confirmationVisible}
        onDismiss={friendGardenGuard.dismissExit}
        onConfirm={friendGardenGuard.confirmExit}
      />
    </>
  );
}
