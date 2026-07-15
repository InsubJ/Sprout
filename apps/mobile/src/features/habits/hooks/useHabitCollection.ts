import { useCallback, useEffect, useRef, useState } from "react";
import type { Habit } from "@sprout/shared";
import { useAuth } from "../../../providers/AuthProvider";
import { useServices } from "../../../providers/ServicesProvider";
import { useDataRevision } from "../../../providers/DataProvider";
import { readCachedHabits, writeCachedHabits } from "../services/habitCache";

export interface HabitCollectionState {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateLocal: (update: (habits: Habit[]) => Habit[]) => void;
}

export function useHabitCollection(): HabitCollectionState {
  const { user } = useAuth();
  const { habits: repository } = useServices();
  const { revision } = useDataRevision();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const refresh = useCallback(async (): Promise<void> => {
    const request = ++requestId.current;
    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const cached = await readCachedHabits(user.id);
      if (cached.length && request === requestId.current) {
        setHabits(cached);
        setLoading(false);
      }
    } catch {
      // A fresh server response below replaces malformed or stale cache data.
    }
    try {
      const fresh = await repository.getByUserId(user.id);
      if (request === requestId.current) setHabits(fresh);
      await writeCachedHabits(user.id, fresh);
    } catch (cause) {
      if (request === requestId.current)
        setError(cause instanceof Error ? cause.message : "Unable to refresh habits");
    } finally {
      if (request === requestId.current) setLoading(false);
    }
  }, [repository, user]);
  useEffect(() => {
    void refresh();
    return () => {
      requestId.current += 1;
    };
  }, [refresh, revision]);
  const updateLocal = useCallback(
    (update: (current: Habit[]) => Habit[]): void => setHabits(update),
    [],
  );
  return { habits, loading, error, refresh, updateLocal };
}
