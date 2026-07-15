import type { Habit } from "@sprout/shared";
import { filterFriendForestHabits } from "./useFriendForestFilter";

const habit = (id: string, name: string, status: Habit["status"]): Habit =>
  ({
    id,
    name,
    status,
    description: `${name} description`,
  }) as Habit;

describe("friend forest filtering", () => {
  const habits = [
    habit("1", "Fern", "healthy"),
    habit("2", "Aloe", "withered"),
    habit("3", "Oak", "completed"),
  ];

  it("excludes completed plants and prioritises withered plants", () => {
    expect(filterFriendForestHabits(habits, "", "all").map((item) => item.id)).toEqual(["2", "1"]);
  });

  it("filters by status and search text", () => {
    expect(filterFriendForestHabits(habits, "fern", "healthy").map((item) => item.id)).toEqual([
      "1",
    ]);
    expect(filterFriendForestHabits(habits, "fern", "withered")).toEqual([]);
  });
});
