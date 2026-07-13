import type AsyncStorageType from "@react-native-async-storage/async-storage";
import type { SupportPaymentRepository } from "@sprout/services";
import { recordDemoSupportPayment } from "../features/customPlants/services/demoRewardState";
type Storage = Pick<typeof AsyncStorageType, "getItem" | "setItem">;
export class DemoSupportPaymentRepository implements SupportPaymentRepository {
  constructor(private readonly storage: Storage) {}
  async createCheckout(
    amountUsdCents: number,
    userId?: string,
  ): Promise<{ checkoutUrl: string | null; completed: boolean }> {
    if (!userId) throw new Error("User ID is required");
    await recordDemoSupportPayment(this.storage, userId, amountUsdCents);
    return { checkoutUrl: null, completed: true };
  }
}
