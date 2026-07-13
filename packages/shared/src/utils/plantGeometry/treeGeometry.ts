export interface TreeTrunkGeometry {
  trunkHeight: number;
  topY: number;
}

export interface TreeBranch {
  path: string;
  leafX: number;
  leafY: number;
}

export interface TreeBranchOptions {
  maxBranches?: number;
  branchDensity?: number;
  spreadBase?: number;
  spreadStep?: number;
}

/**
 * computeTreeTrunk
 *
 * Generic trunk-height calculation shared by every tree-shaped species
 * (bonsai, ethereal sakura, golden oak, ...). Species differ only in
 * baseHeight/heightMultiplier, not in the shape of the calculation.
 *
 * Precondition: growthPercent in [0, 100].
 * Postcondition: topY < 300.
 */
export function computeTreeTrunk(
  growthPercent: number,
  baseHeight = 30,
  heightMultiplier = 0.9,
): TreeTrunkGeometry {
  const trunkHeight = baseHeight + growthPercent * heightMultiplier;
  return { trunkHeight, topY: 300 - trunkHeight };
}

/**
 * computeTreeBranches
 *
 * Generic branch-placement calculation shared by every tree-shaped species.
 *
 * Precondition: asymmetry in [0, 20], topY from computeTreeTrunk.
 * Postcondition: returns between 0 and options.maxBranches branches.
 */
export function computeTreeBranches(
  growthPercent: number,
  asymmetry: number,
  topY: number,
  options: TreeBranchOptions = {},
): TreeBranch[] {
  const { maxBranches = 5, branchDensity = 20, spreadBase = 20, spreadStep = 6 } = options;

  const branchCount = Math.min(maxBranches, Math.floor(growthPercent / branchDensity) + 1);
  const branches: TreeBranch[] = [];

  for (let i = 0; i < branchCount; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const wobble = i % 2 === 0 ? asymmetry : -asymmetry * 0.6;
    const leafX = 200 + side * (spreadBase + i * spreadStep) + wobble;
    const leafY = topY + i * 8 - 10;
    const startY = topY + i * 10;

    branches.push({
      path: `M200 ${startY} Q${(200 + leafX) / 2} ${leafY - 10} ${leafX} ${leafY}`,
      leafX,
      leafY,
    });
  }

  return branches;
}
