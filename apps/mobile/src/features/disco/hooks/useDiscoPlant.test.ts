import { computeDiscoState } from "./useDiscoPlant";

describe("computeDiscoState", () => {
  it("returns withered when lastWateredAt is null", () => {
    expect(computeDiscoState(null)).toBe("withered");
  });

  it("returns dancing when watered within 24 hours", () => {
    const now = new Date("2026-07-22T12:00:00.000Z").getTime();
    const lastWatered = "2026-07-22T06:00:00.000Z"; // 6 hours ago
    expect(computeDiscoState(lastWatered, now)).toBe("dancing");
  });

  it("returns smiling when watered between 24 and 48 hours ago", () => {
    const now = new Date("2026-07-22T12:00:00.000Z").getTime();
    const lastWatered = "2026-07-21T06:00:00.000Z"; // 30 hours ago
    expect(computeDiscoState(lastWatered, now)).toBe("smiling");
  });

  it("returns withered when watered 48 hours ago or more", () => {
    const now = new Date("2026-07-22T12:00:00.000Z").getTime();
    const lastWatered = "2026-07-20T10:00:00.000Z"; // 50 hours ago
    expect(computeDiscoState(lastWatered, now)).toBe("withered");
  });
});
