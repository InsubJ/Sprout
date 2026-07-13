import type AsyncStorageType from "@react-native-async-storage/async-storage";
import {
  consumeDemoGenerationCredit,
  readDemoRewardState,
  recordDemoAdReward,
  recordDemoSupportPayment,
} from "./demoRewardState";

function storage(): Pick<typeof AsyncStorageType, "getItem" | "setItem"> {
  const values = new Map<string, string>();
  return {
    getItem: jest.fn(async (key: string) => values.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      values.set(key, value);
    }),
  };
}
describe("demo reward state", () => {
  it("increments ad progress and converts the twentieth ad into one credit", async () => {
    const store = storage();
    for (let count = 0; count < 19; count += 1) await recordDemoAdReward(store, "user");
    expect(await readDemoRewardState(store, "user")).toEqual({
      availableCredits: 0,
      verifiedAdsTowardNextCredit: 19,
      donationRemainderUsdCents: 0,
    });
    await recordDemoAdReward(store, "user");
    expect(await readDemoRewardState(store, "user")).toEqual({
      availableCredits: 1,
      verifiedAdsTowardNextCredit: 0,
      donationRemainderUsdCents: 0,
    });
  });
  it("grants one support credit and consumes it only when saving", async () => {
    const store = storage();
    await recordDemoSupportPayment(store, "user", 500);
    expect((await readDemoRewardState(store, "user")).availableCredits).toBe(1);
    await consumeDemoGenerationCredit(store, "user");
    expect((await readDemoRewardState(store, "user")).availableCredits).toBe(0);
  });
  it("caps banked generation credits at five", async () => {
    const store = storage();
    for (let count = 0; count < 8; count += 1) await recordDemoSupportPayment(store, "user", 500);
    expect((await readDemoRewardState(store, "user")).availableCredits).toBe(5);
  });
  it("tracks donation remainder across payments", async () => {
    const store = storage();
    await recordDemoSupportPayment(store, "user", 300);
    await recordDemoSupportPayment(store, "user", 400);
    expect(await readDemoRewardState(store, "user")).toEqual({
      availableCredits: 1,
      verifiedAdsTowardNextCredit: 0,
      donationRemainderUsdCents: 200,
    });
  });
  it("accepts the inclusive one-dollar donation minimum", async () => {
    const store = storage();
    await recordDemoSupportPayment(store, "user", 100);
    expect((await readDemoRewardState(store, "user")).donationRemainderUsdCents).toBe(100);
  });
});
