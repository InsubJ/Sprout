export interface PlantGodAuraRay {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  angle: number;
}
export function createPlantGodAuraRays(count = 12): PlantGodAuraRay[] {
  if (!Number.isInteger(count) || count < 1 || count > 48)
    throw new Error("Aura ray count must be an integer from 1 to 48");
  return Array.from({ length: count }, (_, index) => {
    const angle = (index * 360) / count,
      radians = (angle * Math.PI) / 180;
    return {
      angle,
      x1: 200 + 154 * Math.sin(radians),
      y1: 184 - 154 * Math.cos(radians),
      x2: 200 + 176 * Math.sin(radians),
      y2: 184 - 176 * Math.cos(radians),
    };
  });
}
