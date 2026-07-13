export interface DogBody {
  bodyLength: number;
  bodyHeight: number;
  legLength: number;
  headRadius: number;
  tailLength: number;
  torsoY: number;
}

export interface DogLeg {
  path: string;
  pawX: number;
  pawY: number;
}

export interface DogLegs {
  frontLeft: DogLeg;
  frontRight: DogLeg;
  backLeft: DogLeg;
  backRight: DogLeg;
}

export interface DogEar {
  path: string;
}

export interface DogEars {
  left: DogEar;
  right: DogEar;
}

export type DogEyeType = "round" | "droopy" | "sparkle";

export interface DogFace {
  eyeShape: DogEyeType;
  mouthPath: string;
}

/**
 * computeDogBody
 *
 * Every dimension scales with growth — body length, height, legs,
 * head, and tail all grow together, same principle as every other
 * species' growth-driven sizing.
 *
 * Precondition: growthPercent in [0, 100].
 * Postcondition: all returned lengths grow monotonically with growthPercent.
 */
export function computeDogBody(growthPercent: number): DogBody {
  const bodyLength = 60 + growthPercent * 0.5;
  const bodyHeight = 22 + growthPercent * 0.18;
  const legLength = 20 + growthPercent * 0.35;
  const headRadius = 18 + growthPercent * 0.14;
  const tailLength = 20 + growthPercent * 0.3;
  const torsoY = 300 - legLength - bodyHeight / 2;

  return { bodyLength, bodyHeight, legLength, headRadius, tailLength, torsoY };
}

/**
 * computeDogLegs
 *
 * Precondition: body from computeDogBody, asymmetry in [0, 20].
 * Postcondition: legs sag inward/shorten visually when withered.
 */
export function computeDogLegs(body: DogBody, isWithered: boolean, asymmetry: number): DogLegs {
  const { bodyLength, legLength, torsoY, bodyHeight } = body;
  const hipY = torsoY + bodyHeight / 2;
  const frontX = 200 - bodyLength / 2 + 10;
  const backX = 200 + bodyLength / 2 - 10;
  const wobble = asymmetry * 0.25;

  const buildLeg = (baseX: number, sideWobble: number): DogLeg => {
    const pawX = baseX + sideWobble;
    const pawY = isWithered ? hipY + legLength * 0.75 : hipY + legLength;
    return {
      path: `M${baseX} ${hipY} L${pawX} ${pawY}`,
      pawX,
      pawY,
    };
  };

  return {
    frontLeft: buildLeg(frontX - 4, -wobble),
    frontRight: buildLeg(frontX + 4, wobble),
    backLeft: buildLeg(backX - 4, -wobble * 0.6),
    backRight: buildLeg(backX + 4, wobble * 0.6),
  };
}

/**
 * computeDogEars
 *
 * Healthy: ears perk up and out. Withered: ears droop flat down along
 * the head, same "droop" language every other species uses.
 */
export function computeDogEars(
  headCenterX: number,
  headCenterY: number,
  headRadius: number,
  isWithered: boolean,
): DogEars {
  const earLength = headRadius * 1.3;

  if (isWithered) {
    return {
      left: {
        path: `M${headCenterX - headRadius * 0.7} ${headCenterY} Q${headCenterX - headRadius * 1.1} ${headCenterY + earLength * 0.6} ${headCenterX - headRadius * 0.5} ${headCenterY + earLength}`,
      },
      right: {
        path: `M${headCenterX + headRadius * 0.7} ${headCenterY} Q${headCenterX + headRadius * 1.1} ${headCenterY + earLength * 0.6} ${headCenterX + headRadius * 0.5} ${headCenterY + earLength}`,
      },
    };
  }

  return {
    left: {
      path: `M${headCenterX - headRadius * 0.7} ${headCenterY - headRadius * 0.3} Q${headCenterX - headRadius * 1.4} ${headCenterY + earLength * 0.3} ${headCenterX - headRadius * 0.9} ${headCenterY + earLength * 0.7}`,
    },
    right: {
      path: `M${headCenterX + headRadius * 0.7} ${headCenterY - headRadius * 0.3} Q${headCenterX + headRadius * 1.4} ${headCenterY + earLength * 0.3} ${headCenterX + headRadius * 0.9} ${headCenterY + earLength * 0.7}`,
    },
  };
}

/**
 * computeDogTail
 *
 * Healthy: a curled, upward vine tail (wagging implied by the curl).
 * Withered: tail droops straight down and limp.
 */
export function computeDogTail(
  baseX: number,
  baseY: number,
  tailLength: number,
  isWithered: boolean,
): string {
  if (isWithered) {
    return `M${baseX} ${baseY} Q${baseX + 6} ${baseY + tailLength * 0.6} ${baseX + 4} ${baseY + tailLength}`;
  }
  return `M${baseX} ${baseY} Q${baseX + tailLength * 0.8} ${baseY - tailLength * 0.5} ${baseX + tailLength * 0.3} ${baseY - tailLength}`;
}

/**
 * computeDogFace
 *
 * Same wither/completion-driven expression pattern as every other
 * anthropomorphic or characterful species in this system.
 */
export function computeDogFace(
  isWithered: boolean,
  isCompleted: boolean,
  isFlawless: boolean,
): DogFace {
  if (isWithered) {
    return { eyeShape: "droopy", mouthPath: "M-6 6 Q0 2 6 6" };
  }
  if (isCompleted && isFlawless) {
    return { eyeShape: "sparkle", mouthPath: "M-8 4 Q0 14 8 4" };
  }
  return { eyeShape: "round", mouthPath: "M-6 4 Q0 10 6 4" };
}
