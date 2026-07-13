import { describe, expect, it } from "vitest";
import { deriveHabitStatus } from "./habitStatus";
import { getHabitProgress } from "./habitProgress";
import { getWateringAvailability } from "./wateringLimits";
import { assignSpecies, getDifficultyTier } from "../utils/difficulty";
import { createHabitSchema, createHabitLogSchema, profileSchema } from "../index";
describe("habit domain contracts", () => {
  it("caps visible progress while preserving input counts", () => {
    expect(getHabitProgress(12, 10)).toEqual({
      current: 12,
      target: 10,
      ratio: 1,
      percent: 100,
      isComplete: true,
    });
  });
  it("rejects invalid progress targets", () => {
    expect(() => getHabitProgress(0, 0)).toThrow(RangeError);
  });
  it("allows two daily waterings only for twice-daily habits", () => {
    expect(getWateringAvailability("twice_daily", 1)).toMatchObject({
      limit: 2,
      remaining: 1,
      isLimitReached: false,
    });
    expect(getWateringAvailability("daily", 1).isLimitReached).toBe(true);
  });
  it("derives completion before wither status", () => {
    expect(deriveHabitStatus(10, 10, 4, 3)).toBe("completed");
  });
  it("derives withered and healthy states", () => {
    expect(deriveHabitStatus(2, 10, 3, 3)).toBe("withered");
    expect(deriveHabitStatus(2, 10, 0, 3)).toBe("healthy");
  });
  it("assigns a deterministic plant within its calculated tier", () => {
    const tier = getDifficultyTier({
      frequency: "daily",
      target_waterings: 30,
      wither_threshold: 3,
    });
    expect(assignSpecies(tier, 0)).toBeTruthy();
  });
  it("validates habit, log and profile boundaries", () => {
    expect(
      createHabitSchema.safeParse({
        user_id: "11111111-1111-1111-1111-111111111111",
        name: "Walk",
        frequency: "daily",
      }).success,
    ).toBe(true);
    expect(createHabitLogSchema.safeParse({ habit_id: "bad", user_id: "bad" }).success).toBe(false);
    expect(
      profileSchema.safeParse({
        id: "11111111-1111-1111-1111-111111111111",
        username: "a",
        display_name: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
      }).success,
    ).toBe(false);
  });
});
