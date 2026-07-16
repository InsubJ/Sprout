import type { Habit } from "@sprout/shared";
import { habitNeedsWater } from "./useForestFilter";

const habit = (frequency: Habit["frequency"]): Habit => ({ frequency }) as Habit;

describe("forest watering priority", () => {
  it("keeps daily plants first until their daily watering is complete", () => {
    expect(habitNeedsWater(habit("daily"), 0)).toBe(true);
    expect(habitNeedsWater(habit("daily"), 1)).toBe(false);
  });

  it("requires both check-ins for legacy twice-daily plants", () => {
    expect(habitNeedsWater(habit("twice_daily"), 1)).toBe(true);
    expect(habitNeedsWater(habit("twice_daily"), 2)).toBe(false);
  });

  it("rejects invalid watering counts", () => {
    expect(() => habitNeedsWater(habit("daily"), -1)).toThrow(
      "Today's watering count must be a non-negative integer",
    );
  });
});
