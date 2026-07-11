export interface OrchidBloom {
    x: number;
    y: number;
    rotationDeg: number;
}

export interface OrchidGeometry {
    spikePath: string;
    blooms: OrchidBloom[];
    basalLeaves: { x: number; y: number; side: 1 | -1 }[];
}

/**
 * computeOrchidSpike
 *
 * Phalaenopsis grows an arching flower spike with several blooms
 * distributed along the curve, plus a couple of basal leaves — a
 * distinct enough shape (arching raceme) from trees, stalks, vines, or
 * rosettes that it isn't forced into any of those shared geometries.
 *
 * Precondition: growthPercent in [0, 100], asymmetry in [0, 20].
 * Postcondition: bloom count grows with growthPercent, capped at 6.
 */
export function computeOrchidSpike(growthPercent: number, asymmetry: number): OrchidGeometry {
    const spikeLength = 50 + growthPercent * 1.4;
    const sway = asymmetry * 0.4;

    const baseX = 200;
    const baseY = 295;
    const controlX = baseX + 40 + sway;
    const controlY = baseY - spikeLength * 0.55;
    const tipX = baseX + 60 + sway;
    const tipY = baseY - spikeLength;

    const bloomCount = Math.min(6, Math.floor(growthPercent / 16));
    const blooms: OrchidBloom[] = [];
    for (let i = 0; i < bloomCount; i++) {
        const t = 0.35 + (i / Math.max(bloomCount - 1, 1)) * 0.6;
        const x =
            (1 - t) * (1 - t) * baseX + 2 * (1 - t) * t * controlX + t * t * tipX;
        const y =
            (1 - t) * (1 - t) * baseY + 2 * (1 - t) * t * controlY + t * t * tipY;
        blooms.push({ x, y, rotationDeg: -20 + i * 8 });
    }

    const basalLeaves: OrchidGeometry["basalLeaves"] = [
        { x: baseX - 30, y: baseY + 2, side: -1 },
        { x: baseX - 20, y: baseY + 4, side: -1 },
    ];

    return {
        spikePath: `M${baseX} ${baseY} Q${controlX} ${controlY} ${tipX} ${tipY}`,
        blooms,
        basalLeaves,
    };
}