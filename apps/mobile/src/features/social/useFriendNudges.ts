import { useCallback, useEffect, useState } from "react";
import type { Habit } from "@sprout/shared";
import { useAuth } from "../../providers/AuthProvider";
import { useServices } from "../../providers/ServicesProvider";

function utcDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}
export interface FriendNudgesState {
  nudged: string[];
  nudge: (habit: Habit) => Promise<void>;
}
export function useFriendNudges(friendId?: string, enabled = true): FriendNudgesState {
  const { user } = useAuth();
  const { social } = useServices();
  const [nudged, setNudged] = useState<string[]>([]);
  useEffect(() => {
    let active = true;
    if (!enabled || !social || !user || !friendId)
      return () => {
        active = false;
      };
    void social.getNudgedHabitIds(user.id, friendId, utcDateKey()).then((ids) => {
      if (active) setNudged(ids);
    });
    return () => {
      active = false;
    };
  }, [enabled, friendId, social, user]);
  const nudge = useCallback(
    async (habit: Habit): Promise<void> => {
      if (!social || !user || !friendId || nudged.includes(habit.id)) return;
      setNudged((current) => (current.includes(habit.id) ? current : [...current, habit.id]));
      try {
        await social.sendNudge(user.id, friendId, habit.id);
      } catch (cause) {
        setNudged((current) => current.filter((id) => id !== habit.id));
        throw cause;
      }
    },
    [friendId, nudged, social, user],
  );
  return { nudged, nudge };
}
