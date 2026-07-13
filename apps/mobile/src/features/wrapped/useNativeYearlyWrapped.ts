import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DifficultyTier, Habit } from "@sprout/shared";
import { useAuth } from "../../providers/AuthProvider";
import { useServices } from "../../providers/ServicesProvider";

export interface NativeWrappedData {
  year: number;
  habits: Habit[];
  totalPlanted: number;
  totalCompleted: number;
  tierRatios: Record<DifficultyTier, number>;
  averageSetbacks: number;
  bestStreak: number;
  highlight: Habit | null;
}
export interface NativeWrappedState {
  data: NativeWrappedData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}
export function useNativeYearlyWrapped(year: number): NativeWrappedState {
  const { user } = useAuth();
  const { habits: repository } = useServices();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const refresh = useCallback(async (): Promise<void> => {
    const request = ++requestId.current;
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const all = await repository.getByUserId(user.id);
      if (request === requestId.current)
        setHabits(
          all.filter(
            (item) =>
              new Date(item.created_at).getFullYear() === year ||
              Boolean(item.completed_at && new Date(item.completed_at).getFullYear() === year),
          ),
        );
    } catch (cause) {
      if (request === requestId.current)
        setError(cause instanceof Error ? cause.message : "Unable to gather your year");
    } finally {
      if (request === requestId.current) setLoading(false);
    }
  }, [repository, user, year]);
  useEffect(() => {
    void refresh();
    return () => {
      requestId.current += 1;
    };
  }, [refresh]);
  const data = useMemo<NativeWrappedData>(() => {
    const tierRatios = { common: 0, uncommon: 0, rare: 0, mythical: 0 };
    habits.forEach((item) => tierRatios[item.difficulty_tier]++);
    const completed = habits.filter(
      (item) => item.completed_at && new Date(item.completed_at).getFullYear() === year,
    );
    return {
      year,
      habits,
      totalPlanted: habits.length,
      totalCompleted: completed.length,
      tierRatios,
      averageSetbacks: habits.length
        ? Number(
            (habits.reduce((sum, item) => sum + item.wither_count, 0) / habits.length).toFixed(1),
          )
        : 0,
      bestStreak: Math.max(0, ...habits.map((item) => item.max_streak)),
      highlight:
        completed.sort((a, b) => b.current_waterings - a.current_waterings)[0] ?? habits[0] ?? null,
    };
  }, [habits, year]);
  return { data, loading, error, refresh };
}
