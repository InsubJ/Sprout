import type { SupabaseClient } from "@supabase/supabase-js";
import type { CustomPlant } from "@sprout/shared";
import type { CustomPlantRepository } from "../repositories/customPlantRepository";
import type { Database } from "./database.types";
import { mapCustomPlantRow } from "./customPlantRowMapper";
export class SupabaseCustomPlantRepository implements CustomPlantRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}
  async getByOwner(userId: string): Promise<CustomPlant[]> {
    return this.queryOwner(userId);
  }
  async getVisibleForUser(ownerId: string): Promise<CustomPlant[]> {
    return this.queryOwner(ownerId);
  }
  async deleteById(plantId: string): Promise<void> {
    if (!plantId) throw new Error("Plant ID is required");
    const { data, error } = await this.client
      .from("custom_plants")
      .delete()
      .eq("id", plantId)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Custom plant was not found or could not be deleted");
  }
  private async queryOwner(userId: string): Promise<CustomPlant[]> {
    if (!userId) throw new Error("User ID is required");
    const { data, error } = await this.client
      .from("custom_plants")
      .select("*")
      .eq("user_id", userId)
      .is("archived_at", null)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapCustomPlantRow);
  }
  async updateNameAndVisibility(
    plantId: string,
    displayName: string,
    visibility: "friends" | "private",
  ): Promise<CustomPlant> {
    const name = displayName.trim();
    if (!plantId || !name || name.length > 60)
      throw new Error("A valid plant ID and name are required");
    const { data, error } = await this.client
      .from("custom_plants")
      .update({ display_name: name, visibility, updated_at: new Date().toISOString() })
      .eq("id", plantId)
      .select("*")
      .single();
    if (error) throw error;
    return mapCustomPlantRow(data);
  }
}
