export interface Stalk {
    path: string;
    topX: number;
    topY: number;
    topCluster: { x: number; y: number }[];
    leafAttachments: { x: number; y: number; side: 1 | -1 }[];
}

export interface StalkOptions {
    maxStalks?: number;
    stalkDensity?: number;
    heightBase?: number;
    heightMultiplier?: number;
    topClusterSize?: number;
    leafAttachmentsPerStalk?: number;
}

/**
 * computeStalks
 *
 * Generic multi-stalk geometry: several thin stems rise from the pot,
 * each with an optional small cluster at the top (buds) and/or leaf
 * attachment points along the stem. Shared by any multi-stem species
 * (lavender, begonia maculata, ...) — species differ in what's drawn
 * at the top cluster / attachment points, not in the stem math itself.
 *
 * Precondition: growthPercent in [0, 100], asymmetry in [0, 20].
 * Postcondition: returns between 1 and options.maxStalks stalks.
 */
export function computeStalks(
    growthPercent: number,
    asymmetry: number,
    options: StalkOptions = {}
): Stalk[] {
    const {
        maxStalks = 6,
        stalkDensity = 18,
        heightBase = 30,
        heightMultiplier = 1.1,
        topClusterSize = 3,
        leafAttachmentsPerStalk = 0,
    } = options;

    const stalkCount = Math.min(maxStalks, Math.floor(growthPercent / stalkDensity) + 1);
    const stalks: Stalk[] = [];
    const height = heightBase + growthPercent * heightMultiplier;

    for (let i = 0; i < stalkCount; i++) {
        const offset = (i - (stalkCount - 1) / 2) * 14;
        const wobble = (i % 2 === 0 ? 1 : -1) * asymmetry * 0.3;
        const baseX = 200 + offset;
        const topX = baseX + wobble * 0.4;
        const topY = 300 - height - i * 2;

        const topCluster = Array.from({ length: topClusterSize }, (_, b) => ({
            x: topX,
            y: topY + b * 8,
        }));

        const leafAttachments = Array.from({ length: leafAttachmentsPerStalk }, (_, l) => {
            const fraction = (l + 1) / (leafAttachmentsPerStalk + 1);
            return {
                x: baseX,
                y: 300 - height * fraction,
                side: (l % 2 === 0 ? 1 : -1) as 1 | -1,
            };
        });

        stalks.push({
            path: `M${baseX} 300 L${topX} ${topY + 24}`,
            topX,
            topY,
            topCluster,
            leafAttachments,
        });
    }

    return stalks;
}