export interface CactusBodyGeometry {
  bodyHeight: number;
  bodyTopY: number;
}

export interface CactusArm {
  path: string;
  highlightPath: string;
}

export interface CactusSpineRow {
  y: number;
}

/** Precondition: growthPercent in [0, 100]. Postcondition: bodyTopY < 300. */
export function computeCactusBody(growthPercent: number): CactusBodyGeometry {
  const bodyHeight = 40 + growthPercent * 1.1;
  return { bodyHeight, bodyTopY: 300 - bodyHeight };
}

/** Postcondition: returns between 0 and 3 arms, count driven by growthPercent. */
export function computeCactusArms(
  growthPercent: number,
  asymmetry: number,
  bodyTopY: number
): CactusArm[] {
  const armCount = Math.min(3, Math.floor(growthPercent / 30));
  const arms: CactusArm[] = [];

  for (let i = 0; i < armCount; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const wobble = i % 2 === 0 ? asymmetry * 0.5 : -asymmetry * 0.3;
    const armY = bodyTopY + 25 + i * 45;
    const armX = 200 + side * (30 + wobble);
    const path = `M200 ${armY} Q${armX} ${armY} ${armX} ${armY - 35}`;

    arms.push({ path, highlightPath: path });
  }

  return arms;
}

/** Postcondition: returns spine rows only for y positions above bodyTopY. */
export function computeCactusSpineRows(bodyHeight: number, bodyTopY: number): CactusSpineRow[] {
  const rows = Math.max(2, Math.floor(bodyHeight / 20));
  const spineRows: CactusSpineRow[] = [];

  for (let r = 0; r < rows; r++) {
    const y = 295 - r * 20;
    if (y < bodyTopY) break;
    spineRows.push({ y });
  }

  return spineRows;
}
