import { applyCompletedDiscoReward } from "./useDiscoWateringFlow";

describe("applyCompletedDiscoReward", () => {
  it("waters the Disco Plant after a completed ad reward", async () => {
    const action = jest.fn().mockResolvedValue(true);
    const onWater = jest.fn().mockResolvedValue(undefined);
    const onRewardRecorded = jest.fn().mockResolvedValue(undefined);

    await expect(applyCompletedDiscoReward(action, onWater, onRewardRecorded)).resolves.toBe(true);

    expect(action).toHaveBeenCalledTimes(1);
    expect(onWater).toHaveBeenCalledTimes(1);
    expect(onRewardRecorded).toHaveBeenCalledTimes(1);
  });

  it("does not water when a payment flow was not completed", async () => {
    const onWater = jest.fn().mockResolvedValue(undefined);
    const onRewardRecorded = jest.fn().mockResolvedValue(undefined);

    await expect(
      applyCompletedDiscoReward(() => Promise.resolve(false), onWater, onRewardRecorded),
    ).resolves.toBe(false);

    expect(onWater).not.toHaveBeenCalled();
    expect(onRewardRecorded).not.toHaveBeenCalled();
  });
});
