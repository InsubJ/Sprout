export interface GenerationRuntimeConfig {
  maxCalls: number;
  attemptTimeoutMs: number;
}

function boundedInteger(
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}

export function generationRuntimeConfig(): GenerationRuntimeConfig {
  return {
    maxCalls: boundedInteger(Deno.env.get("PLANT_LLM_MAX_TOTAL_CALLS"), 3, 1, 3),
    attemptTimeoutMs: boundedInteger(Deno.env.get("PLANT_LLM_TIMEOUT_MS"), 40_000, 10_000, 40_000),
  };
}
