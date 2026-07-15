import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { type Href, usePathname, useRouter } from "expo-router";
import {
  normalizeRestorableAppRoute,
  readLastAppRoute,
  startupRouteToRestore,
  writeLastAppRoute,
} from "../services/lastAppRoute";

interface RoutePersistenceState {
  userId: string;
  pendingRoute: string | null;
  ready: boolean;
}

export function usePersistentAppRoute(userId: string | undefined): void {
  const pathname = usePathname();
  const router = useRouter();
  const pathnameRef = useRef(pathname);
  const [state, setState] = useState<RoutePersistenceState | null>(null);
  pathnameRef.current = pathname;

  useEffect(() => {
    let active = true;
    if (!userId) {
      setState(null);
      return () => {
        active = false;
      };
    }

    setState({ userId, pendingRoute: null, ready: false });
    void readLastAppRoute(userId)
      .then((storedRoute) => {
        if (!active) return;
        const routeToRestore = startupRouteToRestore(storedRoute, pathnameRef.current);
        if (!routeToRestore) {
          setState({ userId, pendingRoute: null, ready: true });
          return;
        }
        setState({ userId, pendingRoute: routeToRestore, ready: false });
        router.replace(routeToRestore as Href);
      })
      .catch(() => {
        if (active) setState({ userId, pendingRoute: null, ready: true });
      });

    return () => {
      active = false;
    };
  }, [router, userId]);

  useEffect(() => {
    if (
      !userId ||
      state?.userId !== userId ||
      !state.pendingRoute ||
      normalizeRestorableAppRoute(pathname) !== state.pendingRoute
    )
      return;
    setState({ userId, pendingRoute: null, ready: true });
  }, [pathname, state, userId]);

  const ready = Boolean(userId && state?.userId === userId && state.ready);
  useEffect(() => {
    if (userId && ready) void writeLastAppRoute(userId, pathname).catch(() => undefined);
  }, [pathname, ready, userId]);

  useEffect(() => {
    if (!userId || !ready) return;
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active")
        void writeLastAppRoute(userId, pathnameRef.current).catch(() => undefined);
    });
    return () => subscription.remove();
  }, [ready, userId]);
}
