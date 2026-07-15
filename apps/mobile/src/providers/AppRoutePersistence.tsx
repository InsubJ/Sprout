import { usePersistentAppRoute } from "../hooks/usePersistentAppRoute";
import { useAuth } from "./AuthProvider";

export function AppRoutePersistence(): null {
  const { user } = useAuth();
  usePersistentAppRoute(user?.id);
  return null;
}
