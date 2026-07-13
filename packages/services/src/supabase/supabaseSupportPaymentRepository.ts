import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupportPaymentRepository } from "../repositories/supportPaymentRepository";
import type { Database } from "./database.types";
export class SupabaseSupportPaymentRepository implements SupportPaymentRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}
  async createCheckout(
    amountUsdCents: number,
  ): Promise<{ checkoutUrl: string | null; completed: boolean }> {
    const { data, error } = await this.client.functions.invoke("create-stripe-checkout", {
      body: { amountUsdCents },
    });
    if (error) throw error;
    if (!data?.checkoutUrl) throw new Error("Stripe checkout did not return a URL");
    return { checkoutUrl: data.checkoutUrl, completed: false };
  }
}
