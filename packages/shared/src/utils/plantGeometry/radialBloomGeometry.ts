export interface RadialBloomPetal {
  cx: number;
  cy: number;
  rotationDeg: number;
}

export interface RadialBloomGeometry {
  stemPath: string;
  headX: number;
  headY: number;
  headRadius: number;
  petals: RadialBloomPetal[];
  leafPositions: { x: number; y: number; side: 1 | -1 }[];
}

export interface RadialBloomOptions {
  heightBase?: number;
  heightMultiplier?: number;
  headRadiusBase?: number;
  headRadiusMultiplier?: number;
  petalCount?: number;
  petalReach?: number;
  leafHeightFractions?: number[];
}

/**
 * computeBloomPetals
 *
 * Pure petal-ring placement around an arbitrary center. Extracted out of
 * computeRadialBloom so multi-bloom species (e.g. poinsettia's cluster of
 * several small bract rosettes) can generate additional rings without
 * duplicating the angle-loop math.
 *
 * Precondition: radius >= 0, count >= 1.
 * Postcondition: returns exactly `count` petals evenly spaced by angle.
 */
export function computeBloomPetals(
  centerX: number,
  centerY: number,
  radius: number,
  count: number,
  reach: number,
): RadialBloomPetal[] {
  return Array.from({ length: count }, (_, i) => {
    const angleRad = (i / count) * Math.PI * 2;
    return {
      cx: centerX + Math.cos(angleRad) * radius * reach,
      cy: centerY + Math.sin(angleRad) * radius * reach,
      rotationDeg: (angleRad * 180) / Math.PI,
    };
  });
}

/**
 * computeRadialBloom
 *
 * Generic single-stem geometry topped with a radially-arranged bloom
 * (petals/bracts around a center point) that grows with the habit.
 * Shared by any single-stem flowering species (sunflower, waratah,
 * poinsettia, ...) — species differ in petal count/shape/color drawn
 * at each position, not in the stem or radial-placement math itself.
 *
 * Precondition: growthPercent in [0, 100].
 * Postcondition: headRadius grows monotonically with growthPercent.
 */
export function computeRadialBloom(
  growthPercent: number,
  options: RadialBloomOptions = {},
): RadialBloomGeometry {
  const {
    heightBase = 40,
    heightMultiplier = 1.3,
    headRadiusBase = 10,
    headRadiusMultiplier = 0.28,
    petalCount = 12,
    petalReach = 1.6,
    leafHeightFractions = [0.4, 0.65],
  } = options;

  const height = heightBase + growthPercent * heightMultiplier;
  const headY = 300 - height;
  const headRadius = headRadiusBase + growthPercent * headRadiusMultiplier;

  const leafPositions: RadialBloomGeometry["leafPositions"] = [];
  leafHeightFractions.forEach((fraction, i) => {
    const threshold = (i + 1) * 25;
    if (growthPercent >= threshold) {
      leafPositions.push({
        x: 200,
        y: 300 - height * fraction,
        side: (i % 2 === 0 ? 1 : -1) as 1 | -1,
      });
    }
  });

  const petals = computeBloomPetals(200, headY, headRadius, petalCount, petalReach);

  return {
    stemPath: `M200 300 L200 ${headY}`,
    headX: 200,
    headY,
    headRadius,
    petals,
    leafPositions,
  };
}
