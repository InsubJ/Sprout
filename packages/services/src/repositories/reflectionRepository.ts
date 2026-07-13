import type { HabitLog } from "@sprout/shared";
export interface ReflectionRepository {
  getByHabitId(habitId: string): Promise<HabitLog[]>;
  getById(id: string): Promise<HabitLog | null>;
}
