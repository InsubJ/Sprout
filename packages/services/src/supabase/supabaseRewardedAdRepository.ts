import type { SupabaseClient } from "@supabase/supabase-js";
import type { RewardedAdRepository } from "../repositories/rewardedAdRepository";
import type { Database } from "./database.types";
export class SupabaseRewardedAdRepository implements RewardedAdRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}
  async getVerifiedProgress(userId: string): Promise<number> {
    if (!userId) throw new Error("User ID is required");
    const { data, error } = await this.client
      .from("rewarded_ad_events")
      .select("id")
      .eq("user_id", userId)
      .eq("verification_status", "verified")
      .is("credited_at", null);
    if (error) throw error;
    return (data ?? []).length % 20;
  }
  async completeRewardedAd(_userId: string): Promise<void> {
    throw new Error("Rewarded ads are not configured yet");
  }
}
