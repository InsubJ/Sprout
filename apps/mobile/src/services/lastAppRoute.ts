import AsyncStorage from "@react-native-async-storage/async-storage";

const routeKey = (userId: string): string => `sprout_last_route_v1:${userId}`;
const tabRoute = /^\/(forest|sanctuary|buds|lab|profile|wrapped)$/;
const detailRoute = /^\/(habit|reflection|profile|friend-forest|friend-sanctuary)\/[A-Za-z0-9_-]+$/;

export function normalizeRestorableAppRoute(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const withoutQuery = value.trim().split(/[?#]/, 1)[0] ?? "";
  const normalized = withoutQuery.replace(/^\/\(tabs\)/, "").replace(/\/$/, "");
  return tabRoute.test(normalized) || detailRoute.test(normalized) ? normalized : null;
}

export function isRestorableAppRoute(value: unknown): value is string {
  return normalizeRestorableAppRoute(value) !== null;
}

export function startupRouteToRestore(storedRoute: unknown, currentRoute: unknown): string | null {
  const stored = normalizeRestorableAppRoute(storedRoute);
  if (!stored) return null;
  return stored === normalizeRestorableAppRoute(currentRoute) ? null : stored;
}

export async function readLastAppRoute(userId: string): Promise<string | null> {
  if (!userId.trim()) throw new Error("User ID is required to restore navigation");
  const value = await AsyncStorage.getItem(routeKey(userId));
  return normalizeRestorableAppRoute(value);
}

export async function writeLastAppRoute(userId: string, route: string): Promise<void> {
  if (!userId.trim()) throw new Error("User ID is required to persist navigation");
  const normalized = normalizeRestorableAppRoute(route);
  if (!normalized) return;
  await AsyncStorage.setItem(routeKey(userId), normalized);
}
