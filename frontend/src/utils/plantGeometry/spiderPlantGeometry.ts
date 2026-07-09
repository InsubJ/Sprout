export interface SpiderPlantLeaf {
  path: string;
}

export interface SpiderPlantPup {
  cx: number;
  cy: number;
}

/**
 * computeSpiderLeaves
 *
 * Spider plant grows as arching blade leaves radiating from a central
 * point at the pot rim, not a trunk.
 *
 * Precondition: growthPercent in [0, 100], asymmetry in [0, 20].
 * Postcondition: returns between 2 and 9 leaves.
 */
export function computeSpiderLeaves(growthPercent: number, asymmetry: number): SpiderPlantLeaf[] {
  const leafCount = Math.min(9, Math.floor(growthPercent / 12) + 2);
  const leaves: SpiderPlantLeaf[] = [];

  for (let i = 0; i < leafCount; i++) {
    const angleSpread = 140; // degrees, fanning upward from center
    const angleDeg = -angleSpread / 2 + (angleSpread / Math.max(leafCount - 1, 1)) * i;
    const wobble = (i % 2 === 0 ? 1 : -1) * asymmetry * 0.4;
    const angleRad = ((angleDeg + wobble) * Math.PI) / 180;
    const length = 50 + growthPercent * 0.7;

    const tipX = 200 + Math.sin(angleRad) * length;
    const tipY = 300 - Math.cos(angleRad) * length;
    const controlX = 200 + Math.sin(angleRad) * length * 0.6;
    const controlY = 300 - Math.cos(angleRad) * length * 0.75 - 10;

    leaves.push({
      path: `M200 300 Q${controlX} ${controlY} ${tipX} ${tipY}`,
    });
  }

  return leaves;
}

/**
 * computeSpiderPups
 *
 * Baby plantlets only appear once the plant is mostly grown.
 * Precondition: growthPercent in [0, 100].
 * Postcondition: returns 0 pups below 70% growth, up to 2 above it.
 */
export function computeSpiderPups(growthPercent: number): SpiderPlantPup[] {
  if (growthPercent < 70) return [];
  return [
    { cx: 140, cy: 250 },
    { cx: 260, cy: 245 },
  ];
}
