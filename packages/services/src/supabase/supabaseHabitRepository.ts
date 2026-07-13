import {
  validateCreateHabitInput,
  validateUpdateHabitInput,
  type CreateHabitInput,
  type Habit,
  type UpdateHabitInput,
} from "@sprout/shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import { RepositoryError } from "../errors/repositoryError";
import type { HabitRepository } from "../repositories/habitRepository";
import { toRepositoryError } from "./supabaseFailure";

export class SupabaseHabitRepository implements HabitRepository {
  constructor(private readonly client: SupabaseClient) {
    if (!client) throw new Error("Supabase client is required");
  }
  async getById(id: string): Promise<Habit | null> {
    if (!id.trim()) throw new RepositoryError("Habit ID is required", "validation");
    const { data, error } = await this.client.from("habits").select("*").eq("id", id).maybeSingle();
    if (error) throw toRepositoryError("Unable to load habit", error);
    return data as Habit | null;
  }
  async getByUserId(userId: string): Promise<Habit[]> {
    if (!userId.trim()) throw new RepositoryError("User ID is required", "validation");
    const { data, error } = await this.client
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw toRepositoryError("Unable to load habits", error);
    return (data ?? []) as Habit[];
  }
  async create(input: CreateHabitInput): Promise<Habit> {
    const result = validateCreateHabitInput(input);
    if (!result.success)
      throw new RepositoryError(result.errors?.[0]?.message ?? "Invalid habit", "validation");
    const { data, error } = await this.client.from("habits").insert(input).select().single();
    if (error) throw toRepositoryError("Unable to create habit", error);
    return data as Habit;
  }
  async update(id: string, input: UpdateHabitInput): Promise<Habit> {
    if (!id.trim()) throw new RepositoryError("Habit ID is required", "validation");
    const result = validateUpdateHabitInput(input);
    if (!result.success)
      throw new RepositoryError(
        result.errors?.[0]?.message ?? "Invalid habit update",
        "validation",
      );
    const { data, error } = await this.client
      .from("habits")
      .update(input)
      .eq("id", id)
      .select()
      .single();
    if (error?.code === "PGRST116")
      throw new RepositoryError("Habit not found", "not_found", { cause: error });
    if (error) throw toRepositoryError("Unable to update habit", error);
    return data as Habit;
  }
}
