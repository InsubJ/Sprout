import { customPlantSchema, type CustomPlant } from "@sprout/shared";
import type { Json } from "./database.types";
type Row = {
  id: string;
  user_id: string;
  display_name: string;
  original_prompt: string;
  sanitized_prompt: string;
  description: string;
  plant_spec: Json;
  render_version: number;
  rarity: string;
  generation_job_id: string;
  preview_image_url: string | null;
  visibility: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};
export function mapCustomPlantRow(row: Row): CustomPlant {
  return customPlantSchema.parse({
    id: row.id,
    userId: row.user_id,
    displayName: row.display_name,
    originalPrompt: row.original_prompt,
    sanitizedPrompt: row.sanitized_prompt,
    description: row.description,
    plantSpec: row.plant_spec,
    renderVersion: row.render_version,
    rarity: row.rarity,
    generationJobId: row.generation_job_id,
    previewImageUrl: row.preview_image_url,
    visibility: row.visibility,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
  });
}
