import { useCallback, useEffect, useMemo, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import type { Habit } from "@sprout/shared";

export interface HabitSelectionState {
  habit: Habit | null;
  open(item: Habit): void;
  close(): void;
}

/**
 * Hook to manage in-memory selection of a habit (e.g., for showing its reflections logbook).
 * It resets the selection (closes the logbook modal) when the app is reopened/resumed.
 */
export function useHabitSelection(
  habits: readonly Habit[],
): HabitSelectionState {
  const [habitId, setHabitId] = useState<string | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (status: AppStateStatus) => {
      if (status === "active") {
        setHabitId(null);
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const habit = useMemo(
    () => habits.find((item) => item.id === habitId) ?? null,
    [habits, habitId],
  );

  const open = useCallback((item: Habit): void => {
    setHabitId(item.id);
  }, []);

  const close = useCallback((): void => {
    setHabitId(null);
  }, []);

  return { habit, open, close };
}
