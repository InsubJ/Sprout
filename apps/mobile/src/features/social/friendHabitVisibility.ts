import type { Habit } from "@sprout/shared";

export function visibleHabitForVisitor(habit: Habit, viewerId: string): Habit {
  return {
    ...habit,
    name:
      habit.hide_name && !habit.share_name_friends?.includes(viewerId)
        ? "Private Plant"
        : habit.name,
    description:
      habit.hide_description && !habit.share_desc_friends?.includes(viewerId)
        ? null
        : habit.description,
  };
}
