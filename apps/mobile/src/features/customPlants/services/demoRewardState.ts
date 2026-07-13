import type AsyncStorageType from "@react-native-async-storage/async-storage";

type Storage = Pick<typeof AsyncStorageType, "getItem" | "setItem">;
type ReadStorage = Pick<typeof AsyncStorageType, "getItem">;
interface DemoRewardState {
  availableCredits: number;
  verifiedAdsTowardNextCredit: number;
  donationRemainderUsdCents: number;
}
export const MAX_BANKED_GENERATION_CREDITS = 5;
const key = (userId: string) => `sprout_demo_reward_state_v1:${userId}`;
const empty: DemoRewardState = {
  availableCredits: 0,
  verifiedAdsTowardNextCredit: 0,
  donationRemainderUsdCents: 0,
};
export async function readDemoRewardState(
  storage: ReadStorage,
  userId: string,
): Promise<DemoRewardState> {
  const raw = await storage.getItem(key(userId));
  if (!raw) return empty;
  const parsed = JSON.parse(raw) as Partial<DemoRewardState>;
  return {
    availableCredits: Math.max(0, Math.floor(parsed.availableCredits ?? 0)),
    verifiedAdsTowardNextCredit:
      Math.max(0, Math.floor(parsed.verifiedAdsTowardNextCredit ?? 0)) % 20,
    donationRemainderUsdCents: Math.max(0, Math.floor(parsed.donationRemainderUsdCents ?? 0)) % 500,
  };
}
export async function recordDemoAdReward(
  storage: Storage,
  userId: string,
): Promise<DemoRewardState> {
  const current = await readDemoRewardState(storage, userId),
    ads = current.verifiedAdsTowardNextCredit + 1;
  const next = {
    availableCredits: Math.min(
      MAX_BANKED_GENERATION_CREDITS,
      current.availableCredits + (ads === 20 ? 1 : 0),
    ),
    verifiedAdsTowardNextCredit: ads % 20,
    donationRemainderUsdCents: current.donationRemainderUsdCents,
  };
  await storage.setItem(key(userId), JSON.stringify(next));
  return next;
}
export async function recordDemoSupportPayment(
  storage: Storage,
  userId: string,
  amountUsdCents: number,
): Promise<DemoRewardState> {
  if (!Number.isInteger(amountUsdCents) || amountUsdCents < 100)
    throw new Error("Donation must be at least USD $1.00");
  const current = await readDemoRewardState(storage, userId),
    total = current.donationRemainderUsdCents + amountUsdCents,
    next = {
      ...current,
      availableCredits: Math.min(
        MAX_BANKED_GENERATION_CREDITS,
        current.availableCredits + Math.floor(total / 500),
      ),
      donationRemainderUsdCents: total % 500,
    };
  await storage.setItem(key(userId), JSON.stringify(next));
  return next;
}
export async function consumeDemoGenerationCredit(storage: Storage, userId: string): Promise<void> {
  const current = await readDemoRewardState(storage, userId);
  if (current.availableCredits < 1) throw new Error("A generation credit is required");
  await storage.setItem(
    key(userId),
    JSON.stringify({ ...current, availableCredits: current.availableCredits - 1 }),
  );
}
