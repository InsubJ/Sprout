export interface RoseThorn {
  x: number;
  y: number;
  angleDeg: number;
}

export interface RoseGeometry {
  stemPath: string;
  thorns: RoseThorn[];
  bloomX: number;
  bloomY: number;
  bloomRadius: number;
}

/**
 * computeRoseStem
 *
 * Midnight Rose grows as a single thorned stem topped with a bloom that
 * opens (radius grows) as the habit matures.
 *
 * Precondition: growthPercent in [0, 100], asymmetry in [0, 20].
 * Postcondition: thorn count grows with stem height; bloomRadius grows
 * monotonically with growthPercent.
 */
export function computeRoseStem(growthPercent: number, asymmetry: number): RoseGeometry {
  const height = 35 + growthPercent * 1.15;
  const bloomY = 300 - height;
  const sway = asymmetry * 0.3;
  const topX = 200 + sway;

  const thornRows = Math.max(1, Math.floor(height / 25));
  const thorns: RoseThorn[] = [];
  for (let i = 0; i < thornRows; i++) {
    const y = 290 - i * 25;
    if (y < bloomY + 15) break;
    const side = i % 2 === 0 ? 1 : -1;
    thorns.push({ x: 200 + side * 6, y, angleDeg: side * 35 });
  }

  return {
    stemPath: `M200 300 Q${200 + sway * 0.5} ${300 - height * 0.5} ${topX} ${bloomY + 10}`,
    thorns,
    bloomX: topX,
    bloomY,
    bloomRadius: 8 + growthPercent * 0.16,
  };
}
