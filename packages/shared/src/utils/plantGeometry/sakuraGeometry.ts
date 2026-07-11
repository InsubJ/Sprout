export interface FloatingPetal {
  cx: number;
  cy: number;
  r: number;
  rotation: number;
}

/**
 * computeFloatingPetals
 *
 * Species-specific to ethereal sakura (and any future blossom-drift
 * species) — distinct from computeGlimmerSparkles, which is the
 * generic mythical-tier shimmer. Deterministic, no Math.random.
 *
 * Precondition: growthPercent in [0, 100].
 * Postcondition: petal count grows with growthPercent, capped at 7.
 */
export function computeFloatingPetals(growthPercent: number, topY: number): FloatingPetal[] {
  const count = Math.min(7, Math.floor(growthPercent / 15));
  const petals: FloatingPetal[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / Math.max(count, 1)) * Math.PI * 2 + growthPercent * 0.02;
    const radius = 60 + (i % 3) * 15;
    petals.push({
      cx: 200 + Math.cos(angle) * radius,
      cy: topY - 10 + Math.sin(angle) * radius * 0.5,
      r: 3 + (i % 2),
      rotation: (angle * 180) / Math.PI,
    });
  }

  return petals;
}
