export interface RewardedAdRepository {
  getVerifiedProgress(userId: string): Promise<number>;
  completeRewardedAd(userId: string): Promise<void>;
}
