import { HumanoidBody } from "./humanoidBodyGeometry";

export interface RemyLimb {
  path: string;
  endX: number;
  endY: number;
}

export interface RemyLimbs {
  leftLeg: RemyLimb;
  rightLeg: RemyLimb;
  leftArm: RemyLimb;
  rightArm: RemyLimb;
}

export type RemyEyeType = "wink" | "open" | "droopy" | "sparkle";

export interface RemyFace {
  mouthPath: string;
  leftEye: RemyEyeType;
  rightEye: RemyEyeType;
}

// Body proportions now come from the shared computeHumanoidBody —
// see humanoidBodyGeometry.ts. Remy calls it directly with defaults
// matching his original numbers.

/**
 * computeRemyLimbs
 *
 * Healthy: a jaunty, asymmetric rascal stance — one leg planted, one
 * kicked out, one hand on hip, one arm out in a cheeky point/wave.
 * Withered: stance collapses inward, arms hang limp — same "droop"
 * language every other species uses for wither.
 *
 * Precondition: growthPercent in [0, 100], asymmetry in [0, 20].
 */
export function computeRemyLimbs(
  body: HumanoidBody,
  isWithered: boolean,
  asymmetry: number,
): RemyLimbs {
  const { hipY, shoulderY } = body;
  const wobble = asymmetry * 0.4;

  // Legs: rascal stance kicks the right leg out; withered tucks both in.
  const leftHipX = 200 - 7;
  const rightHipX = 200 + 7;
  const leftFootX = isWithered ? leftHipX + 3 : leftHipX - 4;
  const rightFootX = isWithered ? rightHipX - 3 : rightHipX + 16 + wobble;
  const leftFootY = isWithered ? 296 : 300;
  const rightFootY = isWithered ? 296 : 296;

  const leftLeg: RemyLimb = {
    path: `M${leftHipX} ${hipY} Q${leftHipX - 4} ${(hipY + leftFootY) / 2} ${leftFootX} ${leftFootY}`,
    endX: leftFootX,
    endY: leftFootY,
  };
  const rightLeg: RemyLimb = {
    path: `M${rightHipX} ${hipY} Q${rightHipX + 10} ${(hipY + rightFootY) / 2} ${rightFootX} ${rightFootY}`,
    endX: rightFootX,
    endY: rightFootY,
  };

  // Arms: left hand rests on hip; right arm out in a confident point,
  // or both hang straight down and limp when withered.
  const leftShoulderX = 200 - 14;
  const rightShoulderX = 200 + 14;

  const leftHandX = isWithered ? leftShoulderX - 2 : leftShoulderX - 6;
  const leftHandY = isWithered ? shoulderY + 22 : shoulderY + 12;
  const leftArm: RemyLimb = {
    path: `M${leftShoulderX} ${shoulderY} Q${leftShoulderX - 10} ${shoulderY + 6} ${leftHandX} ${leftHandY}`,
    endX: leftHandX,
    endY: leftHandY,
  };

  const rightHandX = isWithered ? rightShoulderX + 3 : rightShoulderX + 22 + wobble;
  const rightHandY = isWithered ? shoulderY + 22 : shoulderY - 8;
  const rightArm: RemyLimb = {
    path: `M${rightShoulderX} ${shoulderY} Q${rightShoulderX + 14} ${shoulderY - 4} ${rightHandX} ${rightHandY}`,
    endX: rightHandX,
    endY: rightHandY,
  };

  return { leftLeg, rightLeg, leftArm, rightArm };
}

/**
 * computeRemyFace
 *
 * Healthy default is the signature rascal look: one eye winking, one
 * open, asymmetric smirk. Withered collapses to matching sad droopy
 * eyes and a frown. Flawless completion upgrades to sparkle eyes and
 * a full grin.
 */
export function computeRemyFace(
  isWithered: boolean,
  isCompleted: boolean,
  isFlawless: boolean,
): RemyFace {
  if (isWithered) {
    // Coordinates are relative to the face group's translated origin
    // (0,0 = head center) — NOT absolute canvas positions.
    return {
      mouthPath: "M-12 12 Q0 4 12 12",
      leftEye: "droopy",
      rightEye: "droopy",
    };
  }
  if (isCompleted && isFlawless) {
    return {
      mouthPath: "M-18 8 Q0 26 18 8",
      leftEye: "sparkle",
      rightEye: "sparkle",
    };
  }
  return {
    mouthPath: "M-16 10 Q2 20 16 6",
    leftEye: "wink",
    rightEye: "open",
  };
}
