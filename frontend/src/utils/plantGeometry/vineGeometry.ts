export interface VinePoint {
    x: number;
    y: number;
    rotation: number;
}

export interface VineStrand {
    path: string;
    points: VinePoint[];
}

export interface VineOptions {
    maxStrands?: number;
    strandDensity?: number;
    pointCount?: number;
    lengthBase?: number;
    lengthMultiplier?: number;
}

/**
 * computeVines
 *
 * Generic trailing-vine geometry: strands drape from the pot rim and
 * lengthen with growth. Shared by any trailing/cascading species
 * (pothos, string of pearls, ...) — species differ only in what's
 * rendered at each vine point (leaf ellipse, pearl bead, etc.), not in
 * the drape math itself.
 *
 * Precondition: growthPercent in [0, 100], asymmetry in [0, 20].
 * Postcondition: returns between 1 and options.maxStrands vines.
 */
export function computeVines(
    growthPercent: number,
    asymmetry: number,
    options: VineOptions = {}
): VineStrand[] {
    const {
        maxStrands = 4,
        strandDensity = 25,
        pointCount = 3,
        lengthBase = 40,
        lengthMultiplier = 0.9,
    } = options;

    const vineCount = Math.min(maxStrands, Math.floor(growthPercent / strandDensity) + 1);
    const vines: VineStrand[] = [];

    for (let i = 0; i < vineCount; i++) {
        const side = i % 2 === 0 ? 1 : -1;
        const wobble = i % 2 === 0 ? asymmetry * 0.5 : -asymmetry * 0.3;
        const baseX = 200 + side * (25 + i * 10);
        const length = lengthBase + growthPercent * lengthMultiplier;
        const endX = baseX + side * (18 + wobble);
        const endY = 300 + length;
        const controlX = baseX + side * 30;
        const controlY = 300 + length * 0.5;

        const fractions = Array.from({ length: pointCount }, (_, p) => (p + 1) / (pointCount + 1));
        const points = fractions.map((t) => {
            const x = (1 - t) * (1 - t) * baseX + 2 * (1 - t) * t * controlX + t * t * endX;
            const y = (1 - t) * (1 - t) * 300 + 2 * (1 - t) * t * controlY + t * t * endY;
            return { x, y, rotation: side * 25 };
        });

        vines.push({
            path: `M${baseX} 300 Q${controlX} ${controlY} ${endX} ${endY}`,
            points,
        });
    }

    return vines;
}