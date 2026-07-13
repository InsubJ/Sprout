import type AsyncStorageType from "@react-native-async-storage/async-storage";
import type { GenerationCreditBalance } from "@sprout/shared";
import type { GenerationCreditRepository } from "@sprout/services";
import { readDemoRewardState } from "../features/customPlants/services/demoRewardState";
export class DemoGenerationCreditRepository implements GenerationCreditRepository {
  constructor(private readonly storage: Pick<typeof AsyncStorageType, "getItem">) {}
  async getBalance(userId: string): Promise<GenerationCreditBalance> {
    const state = await readDemoRewardState(this.storage, userId);
    return {
      availableCredits: state.availableCredits,
      verifiedAdsTowardNextCredit: state.verifiedAdsTowardNextCredit,
      adsRequiredPerCredit: 20,
      donationRemainderUsdCents: state.donationRemainderUsdCents,
    };
  }
}
