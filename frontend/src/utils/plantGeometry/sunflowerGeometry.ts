export interface SunflowerGeometry {
  stemPath: string;
  headX: number;
  headY: number;
  headRadius: number;
  petalCount: number;
  leafPositions: { x: number; y: number; side: 1 | -1 }[];
}

/**
 * computeSunflowerStem
 *
 * Sunflower grows as one thickening stem topped with a flower head that
 * grows in radius as the habit matures.
 *
 * Precondition: growthPercent in [0, 100].
 * Postcondition: headRadius grows monotonically with growthPercent.
 */
export function computeSunflowerStem(growthPercent: number): SunflowerGeometry {
  const height = 40 + growthPercent * 1.3;
  const headY = 300 - height;
  const headRadius = 10 + growthPercent * 0.28;

  const leafPositions: SunflowerGeometry["leafPositions"] = [];
  if (growthPercent >= 25) leafPositions.push({ x: 200, y: 300 - height * 0.4, side: 1 });
  if (growthPercent >= 50) leafPositions.push({ x: 200, y: 300 - height * 0.65, side: -1 });

  return {
    stemPath: `M200 300 L200 ${headY}`,
    headX: 200,
    headY,
    headRadius,
    petalCount: 12,
    leafPositions,
  };
}
