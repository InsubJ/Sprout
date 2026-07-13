import { useEffect, useState } from "react";
import type { Habit } from "@sprout/shared";
import { useServices } from "../../../providers/ServicesProvider";

export interface HabitDetailState {
  habit: Habit | null | undefined;
}

export function useHabitDetail(id: string | undefined): HabitDetailState {
  const { habits } = useServices();
  const [habit, setHabit] = useState<Habit | null | undefined>();

  useEffect(() => {
    let active = true;
    if (!id) {
      setHabit(null);
      return () => {
        active = false;
      };
    }
    setHabit(undefined);
    void habits.getById(id).then(
      (value) => {
        if (active) setHabit(value);
      },
      () => {
        if (active) setHabit(null);
      },
    );
    return () => {
      active = false;
    };
  }, [habits, id]);

  return { habit };
}
