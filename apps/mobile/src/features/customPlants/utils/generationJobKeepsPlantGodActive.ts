import type { PlantGenerationJob } from "@sprout/shared";

export function generationJobKeepsPlantGodActive(
  job: Pick<PlantGenerationJob, "status"> | null,
): boolean {
  return Boolean(job && job.status !== "completed" && job.status !== "cancelled");
}
