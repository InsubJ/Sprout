import { useCallback, useMemo } from "react";
import type { Habit } from "@sprout/shared";
import { usePersistedState } from "../../../hooks/usePersistedState";

function parseHabitId(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "string" || !value.trim()) throw new Error("Saved habit ID is invalid");
  return value;
}

interface PersistedHabitSelectionState {
  habit: Habit | null;
  hydrated: boolean;
  open(item: Habit): void;
  close(): void;
}

export function usePersistedHabitSelection(
  userId: string | undefined,
  scope: string,
  habits: readonly Habit[],
): PersistedHabitSelectionState {
  if (!scope.trim()) throw new Error("Habit selection scope is required");
  const storageKey = userId ? `sprout_open_logbook_v1:${userId}:${scope}` : null;
  const persisted = usePersistedState<string | null>(storageKey, null, parseHabitId);
  const habit = useMemo(
    () => habits.find((item) => item.id === persisted.value) ?? null,
    [habits, persisted.value],
  );
  const open = useCallback(
    (item: Habit): void => persisted.setValue(item.id),
    [persisted.setValue],
  );
  const close = useCallback((): void => persisted.setValue(null), [persisted.setValue]);
  return { habit, open, close, hydrated: persisted.hydrated };
}
