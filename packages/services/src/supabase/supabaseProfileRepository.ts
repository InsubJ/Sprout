import type { Profile } from "@sprout/shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import { RepositoryError } from "../errors/repositoryError";
import type { ProfileRepository } from "../repositories/profileRepository";
import { toRepositoryError } from "./supabaseFailure";

export class SupabaseProfileRepository implements ProfileRepository {
  constructor(private readonly client: SupabaseClient) {
    if (!client) throw new Error("Supabase client is required");
  }
  async getById(id: string): Promise<Profile | null> {
    if (!id.trim()) throw new RepositoryError("Profile ID is required", "validation");
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw toRepositoryError("Unable to load profile", error);
    return data as Profile | null;
  }
  async search(query: string, excludingUserId: string): Promise<Profile[]> {
    if (!excludingUserId.trim())
      throw new RepositoryError("Current user ID is required", "validation");
    if (!query.trim()) return [];
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .neq("id", excludingUserId)
      .ilike("username", `%${query.trim()}%`)
      .limit(20);
    if (error) throw toRepositoryError("Unable to search gardeners", error);
    return (data ?? []) as Profile[];
  }
  async update(profile: Profile): Promise<Profile> {
    if (!profile.id.trim() || profile.username.trim().length < 3)
      throw new RepositoryError(
        "A profile ID and username of at least 3 characters are required",
        "validation",
      );
    const { data, error } = await this.client
      .from("profiles")
      .update({
        username: profile.username.trim(),
        display_name: profile.display_name?.trim() || null,
        avatar_url: profile.avatar_url,
      })
      .eq("id", profile.id)
      .select()
      .single();
    if (error?.code === "PGRST116")
      throw new RepositoryError("Profile not found", "not_found", { cause: error });
    if (error) throw toRepositoryError("Unable to update profile", error);
    return data as Profile;
  }
}
