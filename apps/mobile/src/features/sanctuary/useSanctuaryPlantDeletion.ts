import { useCallback, useState } from "react";
import type { CustomPlant } from "@sprout/shared";

interface SanctuaryPlantDeletion {
  plant: CustomPlant | null;
  deleting: boolean;
  error: string | null;
  requestDeletion(plant: CustomPlant): void;
  cancelDeletion(): void;
  confirmDeletion(): Promise<void>;
}

export function useSanctuaryPlantDeletion(
  deletePlant: (plantId: string) => Promise<void>,
): SanctuaryPlantDeletion {
  const [plant, setPlant] = useState<CustomPlant | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestDeletion = useCallback((nextPlant: CustomPlant): void => {
    if (!nextPlant.id) throw new Error("A saved custom plant is required");
    setError(null);
    setPlant(nextPlant);
  }, []);

  const cancelDeletion = useCallback((): void => {
    if (deleting) return;
    setError(null);
    setPlant(null);
  }, [deleting]);

  const confirmDeletion = useCallback(async (): Promise<void> => {
    if (!plant || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await deletePlant(plant.id);
      setPlant(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete this plant");
    } finally {
      setDeleting(false);
    }
  }, [deletePlant, deleting, plant]);

  return { plant, deleting, error, requestDeletion, cancelDeletion, confirmDeletion };
}
