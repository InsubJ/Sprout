import { generationCreditBalance } from "@sprout/shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { GenerationCreditRepository } from "../repositories/generationCreditRepository";
import type { Database } from "./database.types";
export class SupabaseGenerationCreditRepository implements GenerationCreditRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}
  async getBalance(userId: string) {
    if (!userId) throw new Error("User ID is required");
    const [ledger, ads, payments] = await Promise.all([
      this.client
        .from("generation_credit_ledger")
        .select("credit_delta,event_type")
        .eq("user_id", userId),
      this.client
        .from("rewarded_ad_events")
        .select("id")
        .eq("user_id", userId)
        .eq("verification_status", "verified")
        .is("credited_at", null),
      this.client
        .from("support_payments")
        .select("amount_usd_cents")
        .eq("user_id", userId)
        .eq("status", "paid"),
    ]);
    if (ledger.error) throw ledger.error;
    if (ads.error) throw ads.error;
    if (payments.error) throw payments.error;
    const paidCents = (payments.data ?? []).reduce((sum, row) => sum + row.amount_usd_cents, 0);
    return generationCreditBalance(
      (ledger.data ?? []).reduce((sum, row) => sum + row.credit_delta, 0),
      (ads.data ?? []).length,
      paidCents % 500,
    );
  }
}
