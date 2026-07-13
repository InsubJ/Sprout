import { HumanoidBody } from "./humanoidBodyGeometry";

export interface BlossomLimb {
  path: string;
  endX: number;
  endY: number;
}

export interface BlossomLimbs {
  leftLeg: BlossomLimb;
  rightLeg: BlossomLimb;
  leftArm: BlossomLimb;
  rightArm: BlossomLimb;
}

export type BlossomEyeType = "wink" | "open" | "droopy" | "sparkle";

export interface BlossomFace {
  /** Two paths — upper lip bow and lower lip curve — for a fuller lipstick shape. */
  upperLipPath: string;
  lowerLipPath: string;
  leftEye: BlossomEyeType;
  rightEye: BlossomEyeType;
}

export interface UmbrellaGeometry {
  canopyPath: string;
  polePath: string;
  spokePaths: string[];
  handleX: number;
  handleY: number;
  tiltDeg: number;
}

/**
 * computeBlossomLimbs
 *
 * Legs stand together in a simple, poised stance. Arms raise together
 * to grip an umbrella pole overhead when healthy; withered drops both
 * arms to the sides, same "droop" language as every other species.
 *
 * Precondition: asymmetry in [0, 20].
 */
export function computeBlossomLimbs(
  body: HumanoidBody,
  isWithered: boolean,
  asymmetry: number,
): BlossomLimbs {
  const { hipY, shoulderY } = body;
  const wobble = asymmetry * 0.3;

  const leftHipX = 200 - 6;
  const rightHipX = 200 + 6;
  const leftFootX = leftHipX - 2 + wobble * 0.3;
  const rightFootX = rightHipX + 2 - wobble * 0.3;

  const leftLeg: BlossomLimb = {
    path: `M${leftHipX} ${hipY} Q${leftHipX - 2} ${(hipY + 300) / 2} ${leftFootX} 299`,
    endX: leftFootX,
    endY: 299,
  };
  const rightLeg: BlossomLimb = {
    path: `M${rightHipX} ${hipY} Q${rightHipX + 2} ${(hipY + 300) / 2} ${rightFootX} 299`,
    endX: rightFootX,
    endY: 299,
  };

  const leftShoulderX = 200 - 14;
  const rightShoulderX = 200 + 14;

  // Healthy: both hands raised to meet near the umbrella handle above
  // the head. Withered: arms fall limp to the sides.
  const leftHandX = isWithered ? leftShoulderX - 4 : 200 - 6;
  const leftHandY = isWithered ? shoulderY + 20 : body.headY - body.headRadius * 1.3;
  const rightHandX = isWithered ? rightShoulderX + 4 : 200 + 6;
  const rightHandY = isWithered ? shoulderY + 20 : body.headY - body.headRadius * 1.3;

  const leftArm: BlossomLimb = {
    path: `M${leftShoulderX} ${shoulderY} Q${leftShoulderX - 8} ${(shoulderY + leftHandY) / 2} ${leftHandX} ${leftHandY}`,
    endX: leftHandX,
    endY: leftHandY,
  };
  const rightArm: BlossomLimb = {
    path: `M${rightShoulderX} ${shoulderY} Q${rightShoulderX + 8} ${(shoulderY + rightHandY) / 2} ${rightHandX} ${rightHandY}`,
    endX: rightHandX,
    endY: rightHandY,
  };

  return { leftLeg, rightLeg, leftArm, rightArm };
}

/**
 * computeBlossomFace
 *
 * Healthy default is full lipstick lips with a wink, matching the
 * requested look. Withered collapses to a flat sad line and matching
 * droopy eyes, same pattern as every other species. Flawless
 * completion upgrades to sparkle eyes and fuller open lips.
 */
export function computeBlossomFace(
  isWithered: boolean,
  isCompleted: boolean,
  isFlawless: boolean,
): BlossomFace {
  if (isWithered) {
    return {
      upperLipPath: "M-10 10 Q0 8 10 10",
      lowerLipPath: "M-10 10 Q0 10 10 10",
      leftEye: "droopy",
      rightEye: "droopy",
    };
  }
  if (isCompleted && isFlawless) {
    return {
      upperLipPath: "M-14 6 Q-6 2 0 6 Q6 2 14 6",
      lowerLipPath: "M-14 6 Q0 20 14 6",
      leftEye: "sparkle",
      rightEye: "sparkle",
    };
  }
  return {
    upperLipPath: "M-11 6 Q-5 2 0 6 Q5 2 11 6",
    lowerLipPath: "M-11 6 Q0 15 11 6",
    leftEye: "wink",
    rightEye: "open",
  };
}

/**
 * computeUmbrella
 *
 * A small round umbrella held above the head by both raised hands.
 * Tilts when withered, like it's drooping along with the plant.
 *
 * Precondition: none.
 */
export function computeUmbrella(
  handleX: number,
  handleY: number,
  isWithered: boolean,
): UmbrellaGeometry {
  const tilt = isWithered ? 18 : 0;
  const canopyY = handleY - 8;
  const canopyRadius = 26;

  const spokeCount = 5;
  const spokePaths: string[] = [];
  for (let i = 0; i < spokeCount; i++) {
    const t = i / (spokeCount - 1);
    const spokeX = handleX - canopyRadius + t * canopyRadius * 2;
    spokePaths.push(`M${handleX} ${canopyY} L${spokeX} ${canopyY + 4}`);
  }

  return {
    canopyPath: `M${handleX - canopyRadius} ${canopyY} A${canopyRadius} ${canopyRadius * 0.8} 0 0 1 ${handleX + canopyRadius} ${canopyY} Z`,
    polePath: `M${handleX} ${handleY} L${handleX} ${handleY + 14}`,
    spokePaths,
    handleX,
    handleY,
    tiltDeg: tilt,
  };
}
