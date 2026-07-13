import { generatedPlantSpecSchema } from "../../schemas/customPlantSchema";
import type { GeneratedPlantSpec } from "../../types/customPlant";
export interface GeneratedPlantValidationResult {
  valid: boolean;
  errors: string[];
  spec?: GeneratedPlantSpec;
}
export function validateGeneratedPlantSpec(value: unknown): GeneratedPlantValidationResult {
  const result = generatedPlantSpecSchema.safeParse(value);
  if (!result.success)
    return {
      valid: false,
      errors: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
    };
  const primitiveCount = result.data.layers.reduce(
    (total, layer) => total + (layer.count ?? layer.petalCount ?? 1),
    0,
  );
  if (primitiveCount > 120)
    return { valid: false, errors: ["Rendered primitive count exceeds 120"] };
  return { valid: true, errors: [], spec: result.data };
}
