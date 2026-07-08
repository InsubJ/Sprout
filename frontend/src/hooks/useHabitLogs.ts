import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { HabitLog } from '../types/habitLog';
import { LogService } from '../services/logService';
import { LogServiceContext } from '../services/LogServiceContext';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
function isValidUuid(id: string): boolean {
  return typeof id === 'string' && uuidRegex.test(id);
}

export interface UseHabitLogsResult {
  logs: HabitLog[];
  loading: boolean;
  error: string | null;
  fetchLogs: () => Promise<void>;
  waterHabit: () => Promise<HabitLog>;
}

/**
 * Custom hook to manage habit check-in logs, including automatic fetching,
 * loading/error states, and client-side throttled check-in action.
 * 
 * @param habitId - The UUID of the habit.
 * @param userId - The UUID of the user.
 * @param customService - Optional custom LogService instance.
 * @returns An object containing logs, loading/error states, fetch and water action.
 */
export function useHabitLogs(
  habitId: string,
  userId: string,
  customService?: LogService
): UseHabitLogsResult {
  const contextService = useContext(LogServiceContext);
  const service = customService || contextService;

  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const lastClickRef = useRef<number>(0);
  const isExecutingRef = useRef<boolean>(false);

  const fetchLogs = useCallback(async () => {
    if (!service) {
      setError('LogService is not available');
      return;
    }
    if (!habitId) {
      setError('Habit ID is required');
      return;
    }
    if (!isValidUuid(habitId)) {
      setError('Habit ID must be a valid UUID');
      return;
    }
    if (!userId) {
      setError('User ID is required');
      return;
    }
    if (!isValidUuid(userId)) {
      setError('User ID must be a valid UUID');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fetched = await service.getLogsByHabitId(habitId);
      setLogs(fetched);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [habitId, userId, service]);

  const waterHabit = useCallback(async (): Promise<HabitLog> => {
    if (!service) {
      throw new Error('LogService is not available');
    }
    if (!habitId || !isValidUuid(habitId)) {
      throw new Error('Habit ID must be a valid UUID');
    }
    if (!userId || !isValidUuid(userId)) {
      throw new Error('User ID must be a valid UUID');
    }

    const now = Date.now();
    // Throttling: prevent rapid double-taps within 1000ms
    if (now - lastClickRef.current < 1000) {
      throw new Error('Watering is throttled');
    }
    // Prevent overlapping parallel calls
    if (isExecutingRef.current || loading) {
      throw new Error('Watering is already in progress');
    }

    lastClickRef.current = now;
    isExecutingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const created = await service.createLog({ habit_id: habitId, user_id: userId });
      // Invariant: prepend new check-in to preserve order (newest first)
      setLogs(prev => [created, ...prev]);
      return created;
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg);
      throw err;
    } finally {
      isExecutingRef.current = false;
      setLoading(false);
    }
  }, [habitId, userId, service, loading]);

  useEffect(() => {
    if (habitId && isValidUuid(habitId) && userId && isValidUuid(userId)) {
      fetchLogs();
    } else {
      setLogs([]);
      if (habitId && !isValidUuid(habitId)) {
        setError('Habit ID must be a valid UUID');
      } else if (userId && !isValidUuid(userId)) {
        setError('User ID must be a valid UUID');
      } else {
        setError(null);
      }
    }
  }, [habitId, userId, service, fetchLogs]);

  return {
    logs,
    loading,
    error,
    fetchLogs,
    waterHabit,
  };
}
