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
    upperLipPath: string;
    lowerLipPath: string;
    leftEye: BlossomEyeType;
    rightEye: BlossomEyeType;
}

/**
 * Blossom uses longer legs and relaxed, elegant arms.
 * Healthy arms fall softly away from the torso; withered arms droop closer in.
 */
export function computeBlossomLimbs(
    body: HumanoidBody,
    isWithered: boolean,
    asymmetry: number
): BlossomLimbs {
    const { hipY, shoulderY, legLength } = body;
    const wobble = asymmetry * 0.3;

    const leftHipX = 194;
    const rightHipX = 206;
    const footY = Math.min(308, hipY + legLength * 1.08);

    const leftFootX = leftHipX - 7 + wobble * 0.25;
    const rightFootX = rightHipX + 7 - wobble * 0.25;

    const leftLeg: BlossomLimb = {
        path: `M${leftHipX} ${hipY} Q${leftHipX - 5} ${(hipY + footY) / 2} ${leftFootX} ${footY}`,
        endX: leftFootX,
        endY: footY,
    };

    const rightLeg: BlossomLimb = {
        path: `M${rightHipX} ${hipY} Q${rightHipX + 5} ${(hipY + footY) / 2} ${rightFootX} ${footY}`,
        endX: rightFootX,
        endY: footY,
    };

    const leftShoulderX = 186;
    const rightShoulderX = 214;
    const armLength = Math.max(44, body.torsoHeight * 0.95);

    const leftHandX = isWithered
        ? leftShoulderX - 13
        : leftShoulderX - armLength * 0.58;
    const rightHandX = isWithered
        ? rightShoulderX + 13
        : rightShoulderX + armLength * 0.58;

    const leftHandY = isWithered
        ? shoulderY + armLength * 0.95
        : shoulderY + armLength * 0.82;
    const rightHandY = isWithered
        ? shoulderY + armLength * 0.95
        : shoulderY + armLength * 0.82;

    const leftArm: BlossomLimb = {
        path: `M${leftShoulderX} ${shoulderY}
               Q${leftShoulderX - armLength * 0.38} ${shoulderY + armLength * 0.3}
                ${leftHandX} ${leftHandY}`,
        endX: leftHandX,
        endY: leftHandY,
    };

    const rightArm: BlossomLimb = {
        path: `M${rightShoulderX} ${shoulderY}
               Q${rightShoulderX + armLength * 0.38} ${shoulderY + armLength * 0.3}
                ${rightHandX} ${rightHandY}`,
        endX: rightHandX,
        endY: rightHandY,
    };

    return { leftLeg, rightLeg, leftArm, rightArm };
}

export function computeBlossomFace(
    isWithered: boolean,
    isCompleted: boolean,
    isFlawless: boolean
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