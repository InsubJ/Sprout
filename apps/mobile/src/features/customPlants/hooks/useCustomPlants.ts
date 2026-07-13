import { useCallback, useEffect, useState } from "react";
import type { CustomPlant } from "@sprout/shared";
import { useAuth } from "../../../providers/AuthProvider";
import { useServices } from "../../../providers/ServicesProvider";
import { readCachedCustomPlants, writeCachedCustomPlants } from "../services/customPlantCache";
export function useCustomPlants() {
  const { user } = useAuth();
  const { customPlants } = useServices();
  const [plants, setPlants] = useState<CustomPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    if (!user) {
      setPlants([]);
      setLoading(false);
      return;
    }
    const cached = await readCachedCustomPlants(user.id);
    if (cached.length) setPlants(cached);
    try {
      const fresh = await customPlants.getByOwner(user.id);
      setPlants(fresh);
      await writeCachedCustomPlants(user.id, fresh);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to refresh custom plants");
    } finally {
      setLoading(false);
    }
  }, [customPlants, user]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const deletePlant = useCallback(
    async (plantId: string): Promise<void> => {
      if (!user) throw new Error("Sign in to delete a custom plant");
      if (!plantId) throw new Error("Plant ID is required");
      await customPlants.deleteById(plantId);
      setPlants((current) => current.filter((plant) => plant.id !== plantId));
      try {
        const cached = await readCachedCustomPlants(user.id);
        await writeCachedCustomPlants(
          user.id,
          cached.filter((plant) => plant.id !== plantId),
        );
      } catch {
        // The server is authoritative; the next refresh will repair a stale local cache.
      }
    },
    [customPlants, user],
  );
  return { plants, loading, error, refresh, deletePlant };
}
