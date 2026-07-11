import { useState, useEffect, useCallback, useContext } from 'react';
import { Habit, CreateHabitInput, UpdateHabitInput } from '../types/habit';
import { HabitService } from '../services/habitService';
import { HabitServiceContext } from '../services/HabitServiceContext';

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
function isValidUuid(id: string): boolean {
  return typeof id === 'string' && uuidRegex.test(id);
}

export interface UseHabitsResult {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  fetchHabits: () => Promise<void>;
  addHabit: (input: CreateHabitInput) => Promise<Habit>;
  editHabit: (habitId: string, input: UpdateHabitInput) => Promise<Habit>;
  removeHabit: (habitId: string) => Promise<void>;
}

/**
 * Custom hook to manage habits state, caching, loading, and error states.
 * Uses dependency inversion by retrieving the HabitService from React Context,
 * or accepting an optional HabitService override (primarily for unit tests).
 * 
 * @param userId - The UUID of the user whose habits are being managed.
 * @param customService - An optional custom HabitService instance.
 * @returns An object containing habits list, loading/error states, and CRUD operations.
 */
export function useHabits(userId: string, customService?: HabitService): UseHabitsResult {
  const contextService = useContext(HabitServiceContext);
  const service = customService || contextService;

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    // Preconditions (DbC)
    if (!service) {
      setError('HabitService is not available');
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
      const fetched = await service.getHabits(userId);
      // Postcondition / Invariant (DbC)
      setHabits(fetched);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [userId, service]);

  const addHabit = useCallback(async (input: CreateHabitInput): Promise<Habit> => {
    // Preconditions (DbC)
    if (!service) {
      throw new Error('HabitService is not available');
    }
    if (!input.user_id) {
      throw new Error('User ID is required to create a habit');
    }
    if (input.user_id !== userId) {
      throw new Error('User ID in input must match hook User ID');
    }

    setLoading(true);
    setError(null);
    try {
      const created = await service.createHabit(input);
      // Invariant (DbC): update state and preserve list ordering (newest first)
      setHabits(prev => [created, ...prev]);
      return created;
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, service]);

  const editHabit = useCallback(async (habitId: string, input: UpdateHabitInput): Promise<Habit> => {
    // Preconditions (DbC)
    if (!service) {
      throw new Error('HabitService is not available');
    }
    if (!habitId) {
      throw new Error('Habit ID is required to update a habit');
    }
    if (!isValidUuid(habitId)) {
      throw new Error('Habit ID must be a valid UUID');
    }

    setLoading(true);
    setError(null);
    try {
      const updated = await service.updateHabit(habitId, input);
      // Invariant (DbC): update cached habit details
      setHabits(prev => prev.map(h => h.id === habitId ? updated : h));
      return updated;
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const removeHabit = useCallback(async (habitId: string): Promise<void> => {
    // Preconditions (DbC)
    if (!service) {
      throw new Error('HabitService is not available');
    }
    if (!habitId) {
      throw new Error('Habit ID is required to delete a habit');
    }
    if (!isValidUuid(habitId)) {
      throw new Error('Habit ID must be a valid UUID');
    }

    setLoading(true);
    setError(null);
    try {
      await service.deleteHabit(habitId);
      // Invariant (DbC): remove habit from state cache
      setHabits(prev => prev.filter(h => h.id !== habitId));
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // Fetch habits automatically when userId or service changes
  useEffect(() => {
    if (userId && isValidUuid(userId)) {
      fetchHabits();
    } else {
      setHabits([]);
      if (userId && !isValidUuid(userId)) {
        setError('User ID must be a valid UUID');
      } else {
        setError(null);
      }
    }
  }, [userId, service, fetchHabits]);

  return {
    habits,
    loading,
    error,
    fetchHabits,
    addHabit,
    editHabit,
    removeHabit,
  };
}
