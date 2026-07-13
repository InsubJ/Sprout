import type AsyncStorageType from "@react-native-async-storage/async-storage";
import type { RewardedAdRepository } from "@sprout/services";
import {
  readDemoRewardState,
  recordDemoAdReward,
} from "../features/customPlants/services/demoRewardState";
type Storage = Pick<typeof AsyncStorageType, "getItem" | "setItem">;
export class DemoRewardedAdRepository implements RewardedAdRepository {
  constructor(private readonly storage: Storage) {}
  async getVerifiedProgress(userId: string): Promise<number> {
    return (await readDemoRewardState(this.storage, userId)).verifiedAdsTowardNextCredit;
  }
  async completeRewardedAd(userId: string): Promise<void> {
    await recordDemoAdReward(this.storage, userId);
  }
}
