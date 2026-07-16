import { useCallback, useState } from "react";
import type { CustomPlant, Habit } from "@sprout/shared";

export type SanctuaryDeletionTarget =
  | { kind: "custom"; plant: CustomPlant }
  | { kind: "classic"; habit: Habit };

interface SanctuaryPlantDeletion {
  target: SanctuaryDeletionTarget | null;
  deleting: boolean;
  error: string | null;
  requestCustomPlantDeletion(plant: CustomPlant): void;
  requestHabitDeletion(habit: Habit): void;
  cancelDeletion(): void;
  confirmDeletion(): Promise<void>;
}

export function useSanctuaryPlantDeletion(
  deleteCustomPlant: (plantId: string) => Promise<void>,
  deleteHabit: (habitId: string) => Promise<void>,
): SanctuaryPlantDeletion {
  const [target, setTarget] = useState<SanctuaryDeletionTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestCustomPlantDeletion = useCallback((plant: CustomPlant): void => {
    if (!plant.id) throw new Error("A saved custom plant is required");
    setError(null);
    setTarget({ kind: "custom", plant });
  }, []);

  const requestHabitDeletion = useCallback((habit: Habit): void => {
    if (!habit.id || habit.status !== "completed") throw new Error("A completed habit is required");
    setError(null);
    setTarget({ kind: "classic", habit });
  }, []);

  const cancelDeletion = useCallback((): void => {
    if (deleting) return;
    setError(null);
    setTarget(null);
  }, [deleting]);

  const confirmDeletion = useCallback(async (): Promise<void> => {
    if (!target || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      if (target.kind === "custom") await deleteCustomPlant(target.plant.id);
      else await deleteHabit(target.habit.id);
      setTarget(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete this plant");
    } finally {
      setDeleting(false);
    }
  }, [deleteCustomPlant, deleteHabit, deleting, target]);

  return {
    target,
    deleting,
    error,
    requestCustomPlantDeletion,
    requestHabitDeletion,
    cancelDeletion,
    confirmDeletion,
  };
}
