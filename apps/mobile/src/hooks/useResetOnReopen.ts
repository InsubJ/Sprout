import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useRouter, usePathname } from "expo-router";

/**
 * Hook to reset the app's navigation state to the forest dashboard
 * whenever the app is reopened (cold start or warm resume from background).
 */
export function useResetOnReopen(): void {
  const router = useRouter();
  const pathname = usePathname();
  const lastState = useRef<AppStateStatus>(AppState.currentState);

  // Cold start reset: if the app is launched on a tab other than forest, reset to forest
  useEffect(() => {
    if (pathname !== "/forest" && pathname !== "/(tabs)/forest") {
      router.replace("/(tabs)/forest");
    }
  }, [pathname, router]);

  // Warm start reset: when the app comes to foreground, reset to forest
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (lastState.current.match(/inactive|background/) && nextState === "active") {
        router.replace("/(tabs)/forest");
      }
      lastState.current = nextState;
    });

    return () => {
      subscription.remove();
    };
  }, [router]);
}
