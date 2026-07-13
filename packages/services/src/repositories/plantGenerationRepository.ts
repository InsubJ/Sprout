import type { PlantGenerationJob } from "@sprout/shared";
export interface PlantGenerationRepository {
  generate(requestId: string, prompt: string): Promise<PlantGenerationJob>;
  getJob(jobId: string): Promise<PlantGenerationJob>;
  save(
    jobId: string,
    displayName: string,
    visibility: "friends" | "private",
  ): Promise<PlantGenerationJob>;
}
