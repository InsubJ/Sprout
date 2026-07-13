import { fireEvent, render } from "@testing-library/react-native";
import type { Habit } from "@sprout/shared";
import { HabitCard } from "./HabitCard";
jest.mock("../../../providers/ThemeProvider", () => ({
  useTheme: () => ({
    dark: false,
    background: "#fff",
    surface: "#fff",
    elevated: "#eee",
    text: "#111",
    muted: "#666",
    border: "#ddd",
    setDarkMode: jest.fn(),
  }),
}));
const habit: Habit = {
  id: "habit-1",
  user_id: "user-1",
  name: "Morning walk",
  description: "Go outside",
  plant_type: "pothos",
  difficulty_tier: "common",
  frequency: "daily",
  flexible_rules: null,
  target_waterings: 10,
  current_waterings: 4,
  wither_threshold: 3,
  consecutive_misses: 0,
  wither_count: 0,
  status: "healthy",
  poetic_summary: null,
  is_public: true,
  current_streak: 4,
  max_streak: 4,
  completed_at: null,
  created_at: "2026-07-11T00:00:00.000Z",
};
describe("HabitCard", () => {
  it("renders habit status and progress", async () => {
    const view = await render(
      <HabitCard habit={habit} wateringsToday={0} watering={false} onWater={jest.fn()} />,
    );
    expect(view.getByText("Morning walk")).toBeTruthy();
    expect(view.getByText("4 / 10 (40%)")).toBeTruthy();
    expect(view.getByText("Hydration")).toBeTruthy();
    expect(view.getByText("Plant Specimen:")).toBeTruthy();
    expect(view.getByText("healthy")).toBeTruthy();
  });
  it("starts watering when available", async () => {
    const onWater = jest.fn();
    const view = await render(
      <HabitCard habit={habit} wateringsToday={0} watering={false} onWater={onWater} />,
    );
    fireEvent.press(view.getByRole("button"));
    expect(onWater).toHaveBeenCalledTimes(1);
  });
  it("does not water a completed habit", async () => {
    const onWater = jest.fn();
    const view = await render(
      <HabitCard
        habit={{ ...habit, status: "completed" }}
        wateringsToday={0}
        watering={false}
        onWater={onWater}
      />,
    );
    expect(view.queryByRole("button")).toBeNull();
    expect(onWater).not.toHaveBeenCalled();
  });
});
