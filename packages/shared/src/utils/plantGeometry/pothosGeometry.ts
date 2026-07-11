export interface PothosVine {
  path: string;
  leaves: { x: number; y: number; rotation: number }[];
}

/**
 * computePothosVines
 *
 * Pothos is a trailing vine, not a tree — vines drape from the pot rim
 * and lengthen with growth rather than a trunk rising upward.
 *
 * Precondition: growthPercent in [0, 100], asymmetry in [0, 20].
 * Postcondition: returns between 1 and 4 vines.
 */
export function computePothosVines(growthPercent: number, asymmetry: number): PothosVine[] {
  const vineCount = Math.min(4, Math.floor(growthPercent / 25) + 1);
  const vines: PothosVine[] = [];

  for (let i = 0; i < vineCount; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const wobble = i % 2 === 0 ? asymmetry * 0.5 : -asymmetry * 0.3;
    const baseX = 200 + side * (25 + i * 10);
    const length = 40 + growthPercent * 0.9;
    const endX = baseX + side * (18 + wobble);
    const endY = 300 + length;
    const controlX = baseX + side * 30;
    const controlY = 300 + length * 0.5;

    const leaves = [0.35, 0.62, 0.88].map((t) => {
      const x = (1 - t) * (1 - t) * baseX + 2 * (1 - t) * t * controlX + t * t * endX;
      const y = (1 - t) * (1 - t) * 300 + 2 * (1 - t) * t * controlY + t * t * endY;
      return { x, y, rotation: side * 25 };
    });

    vines.push({
      path: `M${baseX} 300 Q${controlX} ${controlY} ${endX} ${endY}`,
      leaves,
    });
  }

  return vines;
}
