import { createPlantGodAuraRays } from "./plantGodAuraGeometry";
describe("Plant God aura geometry", () => {
  it("creates twelve bounded rays without SVG transforms", () => {
    const rays = createPlantGodAuraRays();
    expect(rays).toHaveLength(12);
    expect(rays[0]).toEqual({ angle: 0, x1: 200, y1: 30, x2: 200, y2: 8 });
    for (const ray of rays) {
      expect(ray.x1).toBeGreaterThanOrEqual(46);
      expect(ray.x1).toBeLessThanOrEqual(354);
      expect(ray.y1).toBeGreaterThanOrEqual(30);
      expect(ray.y1).toBeLessThanOrEqual(338);
    }
  });
  it("rejects unsafe ray counts", () => expect(() => createPlantGodAuraRays(0)).toThrow());
});
