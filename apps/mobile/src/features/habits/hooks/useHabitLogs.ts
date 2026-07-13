import { useCallback, useEffect, useState } from "react";
import type { HabitLog } from "@sprout/shared";
import { useServices } from "../../../providers/ServicesProvider";

export interface HabitLogsState {
  entries: HabitLog[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useHabitLogs(habitId?: string): HabitLogsState {
  const { logs } = useServices();
  const [entries, setEntries] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);
  const retry = useCallback((): void => setRequestId((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (!habitId) {
      setEntries([]);
      setLoading(false);
      setError(null);
      return () => {
        active = false;
      };
    }
    if (!logs) {
      setEntries([]);
      setLoading(false);
      return () => {
        active = false;
      };
    }
    setLoading(true);
    setError(null);
    void Promise.race([
      logs.getByHabitId(habitId),
      new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Reflection entries took too long to load. Please try again.")),
          10000,
        );
      }),
    ])
      .then(
        (items) => {
          if (active)
            setEntries(
              [...items].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
              ),
            );
        },
        (cause) => {
          if (active)
            setError(cause instanceof Error ? cause.message : "Unable to open reflection book");
        },
      )
      .finally(() => {
        if (active) setLoading(false);
        if (timeout) clearTimeout(timeout);
      });
    return () => {
      active = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [habitId, logs, requestId]);

  return { entries, loading, error, retry };
}
