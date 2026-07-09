export interface RadialLeaf {
    path: string;
    tipX: number;
    tipY: number;
    rotationDeg: number;
}

export interface RadialLeafOptions {
    leafCountBase?: number;
    leafDensity?: number;
    maxLeaves?: number;
    angleSpreadDeg?: number;
    lengthBase?: number;
    lengthMultiplier?: number;
}

/**
 * computeRadialLeaves
 *
 * Generic base-rosette geometry: leaves radiate from a single point at
 * the pot rim, fanning across an angle spread. Shared by any
 * rosette-forming species (spider plant, maranta, alocasia, ...) —
 * species differ in leaf count/spread/shape drawn at the tip, not in
 * the radiating math itself.
 *
 * Precondition: growthPercent in [0, 100], asymmetry in [0, 20].
 * Postcondition: returns between leafCountBase and maxLeaves leaves.
 */
export function computeRadialLeaves(
    growthPercent: number,
    asymmetry: number,
    options: RadialLeafOptions = {}
): RadialLeaf[] {
    const {
        leafCountBase = 2,
        leafDensity = 12,
        maxLeaves = 9,
        angleSpreadDeg = 140,
        lengthBase = 50,
        lengthMultiplier = 0.7,
    } = options;

    const leafCount = Math.min(maxLeaves, Math.floor(growthPercent / leafDensity) + leafCountBase);
    const leaves: RadialLeaf[] = [];

    for (let i = 0; i < leafCount; i++) {
        const angleDeg =
            -angleSpreadDeg / 2 + (angleSpreadDeg / Math.max(leafCount - 1, 1)) * i;
        const wobble = (i % 2 === 0 ? 1 : -1) * asymmetry * 0.4;
        const angleRad = ((angleDeg + wobble) * Math.PI) / 180;
        const length = lengthBase + growthPercent * lengthMultiplier;

        const tipX = 200 + Math.sin(angleRad) * length;
        const tipY = 300 - Math.cos(angleRad) * length;
        const controlX = 200 + Math.sin(angleRad) * length * 0.6;
        const controlY = 300 - Math.cos(angleRad) * length * 0.75 - 10;

        leaves.push({
            path: `M200 300 Q${controlX} ${controlY} ${tipX} ${tipY}`,
            tipX,
            tipY,
            rotationDeg: angleDeg + wobble,
        });
    }

    return leaves;
}