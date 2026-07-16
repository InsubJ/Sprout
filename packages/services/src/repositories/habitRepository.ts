import type { CreateHabitInput, Habit, UpdateHabitInput } from "@sprout/shared";
export interface HabitRepository {
  getById(id: string): Promise<Habit | null>;
  getByUserId(userId: string): Promise<Habit[]>;
  create(input: CreateHabitInput): Promise<Habit>;
  update(id: string, input: UpdateHabitInput): Promise<Habit>;
  delete(id: string): Promise<void>;
}
