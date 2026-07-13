import type { CreateHabitLogInput, HabitLog } from "@sprout/shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import { RepositoryError } from "../errors/repositoryError";
import type { LogRepository } from "../repositories/logRepository";
import { toRepositoryError } from "./supabaseFailure";

export class SupabaseLogRepository implements LogRepository {
  constructor(private readonly client: SupabaseClient) {
    if (!client) throw new Error("Supabase client is required");
  }
  async getById(id: string): Promise<HabitLog | null> {
    if (!id.trim()) throw new RepositoryError("Log ID is required", "validation");
    const { data, error } = await this.client
      .from("habit_logs")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw toRepositoryError("Unable to load reflection", error);
    return data as HabitLog | null;
  }
  async getByHabitId(habitId: string): Promise<HabitLog[]> {
    if (!habitId.trim()) throw new RepositoryError("Habit ID is required", "validation");
    const { data, error } = await this.client
      .from("habit_logs")
      .select("*")
      .eq("habit_id", habitId)
      .order("created_at", { ascending: false });
    if (error) throw toRepositoryError("Unable to load reflections", error);
    return (data ?? []) as HabitLog[];
  }
  async countForHabitOnDate(habitId: string, dateKey: string): Promise<number> {
    if (!habitId.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey))
      throw new RepositoryError("A habit ID and ISO date are required", "validation");
    const from = `${dateKey}T00:00:00.000Z`;
    const to = `${dateKey}T23:59:59.999Z`;
    const { count, error } = await this.client
      .from("habit_logs")
      .select("id", { count: "exact", head: true })
      .eq("habit_id", habitId)
      .gte("created_at", from)
      .lte("created_at", to);
    if (error) throw toRepositoryError("Unable to count watering logs", error);
    return count ?? 0;
  }
  async create(input: CreateHabitLogInput): Promise<HabitLog> {
    if (!input.habit_id.trim() || !input.user_id.trim())
      throw new RepositoryError("Habit and user IDs are required", "validation");
    const databaseInput = {
      habit_id: input.habit_id,
      user_id: input.user_id,
      ...(input.note ? { note: input.note } : {}),
      ...(input.image_url ? { image_url: input.image_url } : {}),
      ...(input.client_operation_id ? { client_operation_id: input.client_operation_id } : {}),
    };
    const { data, error } = await this.client
      .from("habit_logs")
      .insert(databaseInput)
      .select()
      .single();
    if (error?.code === "23505" && input.client_operation_id) {
      const { data: existing, error: lookupError } = await this.client
        .from("habit_logs")
        .select("*")
        .eq("client_operation_id", input.client_operation_id)
        .maybeSingle();
      if (lookupError) throw toRepositoryError("Unable to resolve duplicate watering", lookupError);
      if (existing) return existing as HabitLog;
    }
    if (error) throw toRepositoryError("Unable to water habit", error);
    return data as HabitLog;
  }
}
