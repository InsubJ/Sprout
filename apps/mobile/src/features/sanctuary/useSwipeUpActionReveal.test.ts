import { shouldCaptureVerticalSwipe, shouldRevealSwipeAction } from "./useSwipeUpActionReveal";

describe("Sanctuary card swipe-up action", () => {
  it("captures vertical swipes without taking horizontal carousel gestures", () => {
    expect(shouldCaptureVerticalSwipe(4, -36)).toBe(true);
    expect(shouldCaptureVerticalSwipe(40, -20)).toBe(false);
    expect(shouldCaptureVerticalSwipe(2, -8)).toBe(false);
  });

  it("reveals after an intentional upward swipe", () => {
    expect(shouldRevealSwipeAction(false, -34)).toBe(true);
    expect(shouldRevealSwipeAction(false, -20)).toBe(false);
  });

  it("hides a revealed action after a downward swipe", () => {
    expect(shouldRevealSwipeAction(true, 34)).toBe(false);
    expect(shouldRevealSwipeAction(true, 12)).toBe(true);
  });
});
