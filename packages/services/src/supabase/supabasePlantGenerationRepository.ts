import {
  generationRequestSchema,
  saveGeneratedPlantRequestSchema,
  type PlantGenerationJob,
} from "@sprout/shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlantGenerationRepository } from "../repositories/plantGenerationRepository";
import type { Database } from "./database.types";
import { mapPlantGenerationJob } from "./plantGenerationJobMapper";
import { readSupabaseFunctionError } from "./supabaseFunctionError";
export class SupabasePlantGenerationRepository implements PlantGenerationRepository {
  constructor(
    private readonly client: SupabaseClient<Database>,
    private readonly options: { previewMode?: boolean; onPreviewSaved?: () => Promise<void> } = {},
  ) {}
  async generate(requestId: string, prompt: string): Promise<PlantGenerationJob> {
    const body = generationRequestSchema.parse({ requestId, prompt });
    const { data, error } = await this.client.functions.invoke("generate-custom-plant", {
      body: { ...body, previewMode: this.options.previewMode === true },
    });
    if (error) throw await readSupabaseFunctionError(error);
    return mapPlantGenerationJob(data);
  }
  async getJob(jobId: string): Promise<PlantGenerationJob> {
    if (!jobId) throw new Error("Job ID is required");
    const { data, error } = await this.client
      .from("plant_generation_jobs")
      .select("*")
      .eq("id", jobId)
      .single();
    if (error) throw error;
    return mapPlantGenerationJob(data);
  }
  async save(
    jobId: string,
    displayName: string,
    visibility: "friends" | "private",
  ): Promise<PlantGenerationJob> {
    const body = saveGeneratedPlantRequestSchema.parse({ jobId, displayName, visibility });
    const { data, error } = await this.client.functions.invoke("save-custom-plant", { body });
    if (error) throw error;
    const savedJob = mapPlantGenerationJob(data);
    if (this.options.previewMode) await this.options.onPreviewSaved?.();
    return savedJob;
  }
}
