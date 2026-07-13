import { useCallback, useEffect, useState } from "react";
import { getLocalDateKey, type CreateHabitInput, type Habit } from "@sprout/shared";
import { useAuth } from "../../../providers/AuthProvider";
import { useServices } from "../../../providers/ServicesProvider";
import { useSync } from "../../../providers/SyncProvider";
import {
  isRetryableRepositoryError,
  type QueuedHabitLogInput,
  type UploadAsset,
} from "@sprout/services";
import { useHabitCollection } from "./useHabitCollection";
export interface HabitsState {
  habits: Habit[];
  wateringsToday: Record<string, number>;
  lastWateredAt: Record<string, string | null>;
  loading: boolean;
  error: string | null;
  wateringId: string | null;
  refresh: () => Promise<void>;
  create: (input: Omit<CreateHabitInput, "user_id">) => Promise<void>;
  water: (
    habit: Habit,
    details?: { note?: string; imageUrl?: string; pendingAsset?: UploadAsset },
  ) => Promise<void>;
}
export function useHabits(): HabitsState {
  const { user } = useAuth();
  const { habits: repository, logs, queue } = useServices();
  const { refreshPending } = useSync();
  const collection = useHabitCollection();
  const { habits, loading, refresh } = collection;
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [wateringId, setWateringId] = useState<string | null>(null);
  const [wateringsToday, setWateringsToday] = useState<Record<string, number>>({});
  const [lastWateredAt, setLastWateredAt] = useState<Record<string, string | null>>({});
  useEffect(() => {
    let active = true;
    void (async () => {
      if (!user || !logs) {
        setWateringsToday({});
        setLastWateredAt({});
        return;
      }
      try {
        const today = getLocalDateKey(new Date());
        const wateringData = await Promise.all(
          habits.map(async (habit) => {
            const [count, entries] = await Promise.all([
              logs.countForHabitOnDate(habit.id, today),
              logs.getByHabitId(habit.id),
            ]);
            return [habit.id, { count, latest: entries[0]?.created_at ?? null }] as const;
          }),
        );
        if (!active) return;
        setWateringsToday(Object.fromEntries(wateringData.map(([id, value]) => [id, value.count])));
        setLastWateredAt(Object.fromEntries(wateringData.map(([id, value]) => [id, value.latest])));
      } catch (cause) {
        if (active)
          setMutationError(
            cause instanceof Error ? cause.message : "Unable to load watering status",
          );
      }
    })();
    return () => {
      active = false;
    };
  }, [habits, logs, user]);
  const create = useCallback(
    async (input: Omit<CreateHabitInput, "user_id">): Promise<void> => {
      if (!user) throw new Error("Sign in before creating a habit");
      await repository.create({ ...input, user_id: user.id });
      await refresh();
    },
    [repository, refresh, user],
  );
  const water = useCallback(
    async (
      habit: Habit,
      details?: { note?: string; imageUrl?: string; pendingAsset?: UploadAsset },
    ): Promise<void> => {
      if (!user) throw new Error("Sign in before watering a habit");
      setWateringId(habit.id);
      setMutationError(null);
      try {
        if (logs) {
          const today = getLocalDateKey(new Date());
          const count = await logs.countForHabitOnDate(habit.id, today);
          if (count >= (habit.frequency === "twice_daily" ? 2 : 1))
            throw new Error("Daily watering limit reached");
          const operationId = `${user.id}-${habit.id}-${Date.now()}`;
          const input: QueuedHabitLogInput = {
            habit_id: habit.id,
            user_id: user.id,
            client_operation_id: operationId,
            note: details?.note,
            image_url: details?.imageUrl,
            pending_asset: details?.pendingAsset,
          };
          if (details?.pendingAsset) {
            await queue.enqueue("CREATE_LOG", input, operationId);
            await refreshPending();
            collection.updateLocal((current) =>
              current.map((item) =>
                item.id === habit.id
                  ? {
                      ...item,
                      current_waterings: Math.min(
                        item.current_waterings + 1,
                        item.target_waterings,
                      ),
                    }
                  : item,
              ),
            );
            return;
          }
          try {
            await logs.create({
              habit_id: input.habit_id,
              user_id: input.user_id,
              client_operation_id: input.client_operation_id,
              note: input.note,
              image_url: input.image_url,
            });
            setWateringsToday((current) => ({
              ...current,
              [habit.id]: (current[habit.id] ?? 0) + 1,
            }));
          } catch (cause) {
            if (!isRetryableRepositoryError(cause)) throw cause;
            await queue.enqueue("CREATE_LOG", input, operationId);
            await refreshPending();
            collection.updateLocal((current) =>
              current.map((item) =>
                item.id === habit.id
                  ? {
                      ...item,
                      current_waterings: Math.min(
                        item.current_waterings + 1,
                        item.target_waterings,
                      ),
                    }
                  : item,
              ),
            );
            return;
          }
        } else {
          await repository.update(habit.id, {
            current_waterings: Math.min(habit.current_waterings + 1, habit.target_waterings),
            current_streak: habit.current_streak + 1,
            max_streak: Math.max(habit.max_streak, habit.current_streak + 1),
            status: habit.current_waterings + 1 >= habit.target_waterings ? "completed" : "healthy",
            completed_at:
              habit.current_waterings + 1 >= habit.target_waterings
                ? new Date().toISOString()
                : null,
          });
        }
        await refresh();
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "Unable to water habit";
        setMutationError(message);
        throw cause;
      } finally {
        setWateringId(null);
      }
    },
    [logs, queue, refresh, refreshPending, repository, user],
  );
  return {
    habits,
    wateringsToday,
    lastWateredAt,
    loading,
    error: mutationError ?? collection.error,
    wateringId,
    refresh,
    create,
    water,
  };
}
