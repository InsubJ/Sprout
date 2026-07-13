export interface HumanoidBody {
  legLength: number;
  torsoHeight: number;
  headRadius: number;
  hipY: number;
  shoulderY: number;
  headY: number;
}

export interface HumanoidBodyOptions {
  legLengthBase?: number;
  legLengthMultiplier?: number;
  torsoHeightBase?: number;
  torsoHeightMultiplier?: number;
  headRadiusBase?: number;
  headRadiusMultiplier?: number;
}

/**
 * computeHumanoidBody
 *
 * Generic growing-body geometry: legs, torso, and head all scale with
 * growthPercent, shared by any anthropomorphic species (Remy, ...) —
 * species differ in stance/limb pose/face, not in the body-proportion
 * math itself.
 *
 * Precondition: growthPercent in [0, 100].
 * Postcondition: all returned lengths/radii grow monotonically with growthPercent.
 */
export function computeHumanoidBody(
  growthPercent: number,
  options: HumanoidBodyOptions = {},
): HumanoidBody {
  const {
    legLengthBase = 20,
    legLengthMultiplier = 0.55,
    torsoHeightBase = 15,
    torsoHeightMultiplier = 0.45,
    headRadiusBase = 20,
    headRadiusMultiplier = 0.16,
  } = options;

  const legLength = legLengthBase + growthPercent * legLengthMultiplier;
  const torsoHeight = torsoHeightBase + growthPercent * torsoHeightMultiplier;
  const headRadius = headRadiusBase + growthPercent * headRadiusMultiplier;

  const hipY = 300 - legLength;
  const shoulderY = hipY - torsoHeight;
  const headY = shoulderY - headRadius * 0.6;

  return { legLength, torsoHeight, headRadius, hipY, shoulderY, headY };
}
