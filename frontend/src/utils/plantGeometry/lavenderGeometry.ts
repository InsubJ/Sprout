export interface LavenderStalk {
  path: string;
  buds: { x: number; y: number }[];
}

/**
 * computeLavenderStalks
 *
 * Lavender grows as several thin upright stalks, each topped with a
 * small cluster of buds — distinct from sunflower's single thick stem.
 *
 * Precondition: growthPercent in [0, 100], asymmetry in [0, 20].
 * Postcondition: returns between 1 and 6 stalks.
 */
export function computeLavenderStalks(growthPercent: number, asymmetry: number): LavenderStalk[] {
  const stalkCount = Math.min(6, Math.floor(growthPercent / 18) + 1);
  const stalks: LavenderStalk[] = [];
  const height = 30 + growthPercent * 1.1;

  for (let i = 0; i < stalkCount; i++) {
    const offset = (i - (stalkCount - 1) / 2) * 14;
    const wobble = (i % 2 === 0 ? 1 : -1) * asymmetry * 0.3;
    const baseX = 200 + offset;
    const topX = baseX + wobble * 0.4;
    const topY = 300 - height - i * 2;

    const buds = [0, 1, 2].map((b) => ({
      x: topX,
      y: topY + b * 8,
    }));

    stalks.push({
      path: `M${baseX} 300 L${topX} ${topY + 24}`,
      buds,
    });
  }

  return stalks;
}
