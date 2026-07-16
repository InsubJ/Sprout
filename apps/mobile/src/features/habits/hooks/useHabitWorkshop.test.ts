import type { HabitFrequency } from "@sprout/shared";
import {
  canContinueHabitWorkshop,
  getHabitFrequencyPeriodLabel,
  getHabitFrequencySummary,
  habitWorkshopSteps,
  type HabitWorkshopAnswers,
} from "./useHabitWorkshop";

const answers = (overrides: Partial<HabitWorkshopAnswers> = {}): HabitWorkshopAnswers => ({
  name: "Read before bed",
  target: "30",
  frequency: "daily",
  daysRequired: "3",
  daysTotal: "7",
  ...overrides,
});

describe("habit workshop", () => {
  it("asks for the rhythm before the tracking goal", () => {
    expect(habitWorkshopSteps).toEqual(["habit", "rhythm", "goal", "grace", "details", "review"]);
  });

  it("requires a named habit before continuing", () => {
    expect(canContinueHabitWorkshop("habit", answers({ name: "  " }))).toBe(false);
    expect(canContinueHabitWorkshop("habit", answers())).toBe(true);
  });

  it("requires a positive whole-number tracking goal", () => {
    expect(canContinueHabitWorkshop("goal", answers({ target: "0" }))).toBe(false);
    expect(canContinueHabitWorkshop("goal", answers({ target: "2.5" }))).toBe(false);
    expect(canContinueHabitWorkshop("goal", answers({ target: "12" }))).toBe(true);
  });

  it("validates a flexible habit window", () => {
    expect(
      canContinueHabitWorkshop(
        "rhythm",
        answers({ frequency: "flexible", daysRequired: "5", daysTotal: "3" }),
      ),
    ).toBe(false);
    expect(
      canContinueHabitWorkshop(
        "rhythm",
        answers({ frequency: "flexible", daysRequired: "3", daysTotal: "7" }),
      ),
    ).toBe(true);
  });

  it.each<[HabitFrequency, string]>([
    ["twice_daily", "twice each day"],
    ["daily", "once each day"],
    ["weekly", "once each week"],
    ["fortnightly", "once each fortnight"],
    ["monthly", "once each month"],
    ["yearly", "once each year"],
  ])("summarizes the %s rhythm", (frequency, expected) => {
    expect(getHabitFrequencySummary(frequency, "3", "7")).toBe(expected);
  });

  it("summarizes a flexible rhythm", () => {
    expect(getHabitFrequencySummary("flexible", "3", "7")).toBe("3 days out of every 7");
  });

  it.each<[HabitFrequency, string]>([
    ["daily", "day"],
    ["weekly", "week"],
    ["fortnightly", "fortnight"],
    ["monthly", "month"],
    ["yearly", "year"],
  ])("uses the correct period label for %s", (frequency, expected) => {
    expect(getHabitFrequencyPeriodLabel(frequency)).toBe(expected);
  });
});
