export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  created_at: string;
}

export interface CreateHabitLogInput {
  habit_id: string;
  user_id: string;
}
