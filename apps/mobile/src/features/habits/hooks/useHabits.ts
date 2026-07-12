import { useCallback, useEffect, useState } from "react";
import {
  getLocalDateKey,
  type CreateHabitInput,
  type Habit,
} from "@sprout/shared";
import { useAuth } from "../../../providers/AuthProvider";
import { useServices } from "../../../providers/ServicesProvider";
import { useSync } from "../../../providers/SyncProvider";
import type { UploadAsset } from "@sprout/services";
import { readCachedHabits, writeCachedHabits } from "../services/habitCache";
export function useHabits() {
  const { user } = useAuth();
  const { habits: repository, logs, queue } = useServices();
  const { refreshPending } = useSync();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wateringId, setWateringId] = useState<string | null>(null);
  const [wateringsToday, setWateringsToday] = useState<Record<string, number>>({});
  const [lastWateredAt, setLastWateredAt] = useState<Record<string, string | null>>({});
  const refresh = useCallback(async () => {
    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const loaded = await repository.getByUserId(user.id);
      setHabits(loaded);
      if (logs) {
        const today = getLocalDateKey(new Date());
        const wateringData = await Promise.all(loaded.map(async (habit) => {
          const [count, entries] = await Promise.all([logs.countForHabitOnDate(habit.id, today), logs.getByHabitId(habit.id)]);
          return [habit.id, { count, latest: entries[0]?.created_at ?? null }] as const;
        }));
        setWateringsToday(Object.fromEntries(wateringData.map(([id, value]) => [id, value.count])));
        setLastWateredAt(Object.fromEntries(wateringData.map(([id, value]) => [id, value.latest])));
      } else {
        setWateringsToday({});
        setLastWateredAt({});
      }
      await writeCachedHabits(user.id, loaded);
    } catch (cause) {
      const cached = await readCachedHabits(user.id);
      if (cached.length) setHabits(cached);
      setError(
        cause instanceof Error ? cause.message : "Showing cached habits",
      );
    } finally {
      setLoading(false);
    }
  }, [repository, user]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const create = useCallback(
    async (input: Omit<CreateHabitInput, "user_id">) => {
      if (!user) throw new Error("Sign in before creating a habit");
      await repository.create({ ...input, user_id: user.id });
      await refresh();
    },
    [repository, refresh, user],
  );
  const water = useCallback(
    async (habit: Habit, details?: { note?: string; imageUrl?: string; pendingAsset?: UploadAsset }) => {
      if (!user) throw new Error("Sign in before watering a habit");
      setWateringId(habit.id);
      setError(null);
      try {
        if (logs) {
          const today = getLocalDateKey(new Date());
          const count = await logs.countForHabitOnDate(habit.id, today);
          if (count >= (habit.frequency === "twice_daily" ? 2 : 1))
            throw new Error("Daily watering limit reached");
          const operationId = `${user.id}-${habit.id}-${Date.now()}`;
          const input = {
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
            setHabits((current) => current.map((item) => item.id === habit.id ? { ...item, current_waterings: Math.min(item.current_waterings + 1, item.target_waterings) } : item));
            return;
          }
          try {
            const { pending_asset: _pendingAsset, ...logInput } = input;
            await logs.create(logInput);
            setWateringsToday((current) => ({ ...current, [habit.id]: (current[habit.id] ?? 0) + 1 }));
          } catch {
            await queue.enqueue("CREATE_LOG", input, operationId);
            await refreshPending();
            setHabits((current) =>
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
            current_waterings: Math.min(
              habit.current_waterings + 1,
              habit.target_waterings,
            ),
            current_streak: habit.current_streak + 1,
            max_streak: Math.max(habit.max_streak, habit.current_streak + 1),
            status:
              habit.current_waterings + 1 >= habit.target_waterings
                ? "completed"
                : "healthy",
            completed_at:
              habit.current_waterings + 1 >= habit.target_waterings
                ? new Date().toISOString()
                : null,
          });
        }
        await refresh();
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : "Unable to water habit";
        setError(message);
        throw cause;
      } finally {
        setWateringId(null);
      }
    },
    [logs, queue, refresh, refreshPending, repository, user],
  );
  return { habits, wateringsToday, lastWateredAt, loading, error, wateringId, refresh, create, water };
}
