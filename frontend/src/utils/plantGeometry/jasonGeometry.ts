export type JasonMouthShape = "frown" | "smile" | "big-smile";
export type JasonEyeShape = "droopy" | "round" | "happy";

export interface JasonFace {
    mouthPath: string;
    eyeShape: JasonEyeShape;
}

export interface JasonArm {
    path: string;
    handX: number;
    handY: number;
}

export interface JasonLimbs {
    leftArm: JasonArm;
    rightArm: JasonArm;
}

/**
 * computeJasonFace
 *
 * Jason's expression is driven entirely by habit state, same as every
 * other species' color/shape changes — no separate "mood" prop.
 *
 * Precondition: none (booleans, either value valid).
 * Postcondition: mouthPath always describes a valid quadratic curve.
 */
export function computeJasonFace(isWithered: boolean, isCompleted: boolean, isFlawless: boolean): JasonFace {
    if (isWithered) {
        // Control point above the baseline => corners droop => frown.
        return { mouthPath: "M182 218 Q200 208 218 218", eyeShape: "droopy" };
    }
    if (isCompleted && isFlawless) {
        // Wider, deeper curve => big open smile.
        return { mouthPath: "M176 214 Q200 236 224 214", eyeShape: "happy" };
    }
    // Control point below the baseline => corners lift => smile.
    return { mouthPath: "M182 214 Q200 226 218 214", eyeShape: "round" };
}

/**
 * computeJasonArms
 *
 * Arms lengthen with growth like any branch geometry, but droop
 * downward when withered instead of reaching outward.
 *
 * Precondition: growthPercent in [0, 100], asymmetry in [0, 20].
 * Postcondition: returns both arms, symmetric aside from asymmetry wobble.
 */
export function computeJasonArms(
    growthPercent: number,
    isWithered: boolean,
    asymmetry: number
): JasonLimbs {
    const bodySize = 30 + growthPercent * 0.35;
    const armLength = 15 + growthPercent * 0.45;
    const shoulderY = 222;

    // Healthy: arms angled up and out (~-35deg from horizontal).
    // Withered: arms hang down (~55deg below horizontal) — a sad, limp posture.
    const angleDeg = isWithered ? 55 : -35;

    const buildArm = (side: 1 | -1, wobble: number): JasonArm => {
        const angleRad = ((isWithered ? angleDeg : angleDeg * side) * Math.PI) / 180;
        const shoulderX = 200 + side * (bodySize - 5);
        const handX = shoulderX + Math.cos(angleRad) * armLength * side + wobble;
        const handY = shoulderY + Math.sin(angleRad) * armLength * (isWithered ? 1 : -1);
        const elbowX = shoulderX + side * armLength * 0.5;
        const elbowY = shoulderY + (isWithered ? armLength * 0.3 : -armLength * 0.15);

        return {
            path: `M${shoulderX} ${shoulderY} Q${elbowX} ${elbowY} ${handX} ${handY}`,
            handX,
            handY,
        };
    };

    return {
        leftArm: buildArm(-1, -asymmetry * 0.3),
        rightArm: buildArm(1, asymmetry * 0.3),
    };
}