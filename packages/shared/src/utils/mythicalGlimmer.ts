export interface GlimmerSparkle {
  cx: number;
  cy: number;
  r: number;
  opacity: number;
}

/**
 * computeGlimmerSparkles
 *
 * Mythical-tier plants (per the difficulty-tier table: "glimmering, gold
 * leaves") share this shimmer effect. Deterministic — uses index-based
 * trig rather than Math.random so SSR output matches client hydration.
 *
 * Precondition: growthPercent in [0, 100].
 * Postcondition: sparkle count grows with growthPercent, capped at 8.
 */
export function computeGlimmerSparkles(growthPercent: number, centerY: number): GlimmerSparkle[] {
  const count = Math.min(8, Math.floor(growthPercent / 15));
  const sparkles: GlimmerSparkle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / Math.max(count, 1)) * Math.PI * 2;
    const radius = 55 + (i % 3) * 18;
    sparkles.push({
      cx: 200 + Math.cos(angle) * radius,
      cy: centerY + Math.sin(angle) * radius * 0.55,
      r: 2 + (i % 2),
      opacity: 0.5 + (i % 3) * 0.15,
    });
  }

  return sparkles;
}
