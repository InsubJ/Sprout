import { describe, expect, it } from "vitest";
import { calculateHabitWilting, deriveHabitStatus } from "./habitStatus";
import { getHabitProgress } from "./habitProgress";
import { getWateringAvailability } from "./wateringLimits";
import { assignSpecies, getDifficultyTier } from "../utils/difficulty";
import { createHabitSchema, createHabitLogSchema, profileSchema, type Habit } from "../index";
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
  it("calculates habit wilting and consecutive misses from elapsed days", () => {
    const baseHabit: Habit = {
      id: "h1",
      user_id: "u1",
      name: "Water Plant",
      description: null,
      plant_type: "bonsai",
      difficulty_tier: "common",
      frequency: "daily",
      flexible_rules: null,
      target_waterings: 10,
      current_waterings: 2,
      wither_threshold: 2,
      consecutive_misses: 0,
      wither_count: 0,
      status: "healthy",
      poetic_summary: null,
      is_public: true,
      current_streak: 2,
      max_streak: 2,
      completed_at: null,
      created_at: "2026-07-15T00:00:00.000Z",
    };
    const now = new Date("2026-07-20T12:00:00.000Z");
    const lastWateredAt = "2026-07-17T12:00:00.000Z"; // 3 days ago -> 2 missed days
    const result = calculateHabitWilting(baseHabit, lastWateredAt, now);
    expect(result.consecutive_misses).toBe(2);
    expect(result.status).toBe("withered");
    expect(result.wither_count).toBe(1);
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
