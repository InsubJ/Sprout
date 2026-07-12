import type { AsyncStorageStatic } from "@react-native-async-storage/async-storage";
import {
  getLocalDateKey,
  type CreateHabitLogInput,
  type HabitLog,
} from "@sprout/shared";
import type { HabitRepository, LogRepository } from "@sprout/services";
const key = "sprout_demo_habit_logs";
const demoLogs: HabitLog[] = [
  {
    id: "demo-willow-reflection-1",
    habit_id: "44444444-4444-4444-4444-444444444444",
    user_id: "33333333-3333-3333-3333-333333333333",
    note: "I slowed the stretch down tonight and my shoulders finally relaxed.",
    created_at: "2026-07-08T09:30:00.000Z",
  },
  {
    id: "demo-willow-reflection-2",
    habit_id: "44444444-4444-4444-4444-444444444444",
    user_id: "33333333-3333-3333-3333-333333333333",
    note: "Five minutes was enough to return to the habit.",
    created_at: "2026-07-05T10:15:00.000Z",
  },
  {
    id: "demo-admin-reflection-1",
    habit_id: "66666666-6666-6666-6666-666666666666",
    user_id: "11111111-1111-1111-1111-111111111111",
    note: "The chapter ended exactly where I wanted tomorrow to begin.",
    created_at: "2026-07-07T11:00:00.000Z",
  },
];
export class DemoLogRepository implements LogRepository {
  constructor(
    private readonly storage: AsyncStorageStatic,
    private readonly habits: HabitRepository,
  ) {}
  private async read(): Promise<HabitLog[]> {
    const raw = await this.storage.getItem(key);
    if (!raw) return demoLogs;
    try {
      const parsed = JSON.parse(raw) as HabitLog[];
      return parsed.length ? parsed : demoLogs;
    } catch {
      return demoLogs;
    }
  }
  private async write(logs: HabitLog[]): Promise<void> {
    await this.storage.setItem(key, JSON.stringify(logs));
  }
  async getById(id: string): Promise<HabitLog | null> {
    if (!id.trim()) throw new Error("Log ID is required");
    return (await this.read()).find((item) => item.id === id) ?? null;
  }
  async getByHabitId(habitId: string): Promise<HabitLog[]> {
    if (!habitId.trim()) throw new Error("Habit ID is required");
    return (await this.read())
      .filter((item) => item.habit_id === habitId)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }
  async countForHabitOnDate(habitId: string, dateKey: string): Promise<number> {
    if (!habitId.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey))
      throw new Error("A habit ID and ISO date are required");
    return (await this.read()).filter(
      (item) =>
        item.habit_id === habitId &&
        getLocalDateKey(new Date(item.created_at)) === dateKey,
    ).length;
  }
  async create(input: CreateHabitLogInput): Promise<HabitLog> {
    if (!input.habit_id.trim() || !input.user_id.trim())
      throw new Error("Habit and user IDs are required");
    const logs = await this.read();
    const duplicate = input.client_operation_id
      ? logs.find(
          (item) => item.client_operation_id === input.client_operation_id,
        )
      : undefined;
    if (duplicate) return duplicate;
    const log: HabitLog = {
      ...input,
      id: `demo-log-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    await this.write([log, ...logs]);
    const habit = await this.habits.getById(input.habit_id);
    if (habit) {
      const waterings = Math.min(
        habit.target_waterings,
        habit.current_waterings + 1,
      );
      await this.habits.update(habit.id, {
        current_waterings: waterings,
        current_streak: habit.current_streak + 1,
        max_streak: Math.max(habit.max_streak, habit.current_streak + 1),
        status: waterings >= habit.target_waterings ? "completed" : "healthy",
        completed_at:
          waterings >= habit.target_waterings
            ? (habit.completed_at ?? new Date().toISOString())
            : habit.completed_at,
      });
    }
    return log;
  }
}
