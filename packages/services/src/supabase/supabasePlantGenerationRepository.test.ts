import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { Database } from "./database.types";
import { SupabasePlantGenerationRepository } from "./supabasePlantGenerationRepository";

const jobId = "123e4567-e89b-12d3-a456-426614174000";

function jobRow(status: "generating" | "completed") {
  return {
    id: jobId,
    user_id: jobId,
    status,
    original_prompt: "A small moonlit tree",
    sanitized_prompt: "A small moonlit tree",
    suggested_name: "Moon Tree",
    edited_name: status === "completed" ? "Moon Tree" : null,
    current_step: status === "completed" ? "Saved to Sanctuary" : "Generating",
    checklist: [],
    provider_attempts: [],
    active_provider: "openrouter",
    attempt_count: 1,
    failure_code: null,
    failure_message: null,
    generated_spec: null,
    custom_plant_id: status === "completed" ? jobId : null,
    credit_reservation_id: jobId,
    created_at: "2026-07-13T00:00:00.000Z",
    started_at: "2026-07-13T00:00:00.000Z",
    completed_at: status === "completed" ? "2026-07-13T00:01:00.000Z" : null,
    updated_at: "2026-07-13T00:01:00.000Z",
  };
}

function repository(onPreviewSaved: () => Promise<void>) {
  const invoke = vi.fn(async (name: string) => ({
    data: jobRow(name === "save-custom-plant" ? "completed" : "generating"),
    error: null,
  }));
  const client = { functions: { invoke } } as unknown as SupabaseClient<Database>;
  return {
    invoke,
    repository: new SupabasePlantGenerationRepository(client, {
      previewMode: true,
      onPreviewSaved,
    }),
  };
}

describe("SupabasePlantGenerationRepository preview credits", () => {
  it("consumes a preview credit only after the plant is saved", async () => {
    const onPreviewSaved = vi.fn(async () => undefined);
    const { repository: plantGeneration } = repository(onPreviewSaved);

    await plantGeneration.generate(jobId, "A small moonlit tree");
    expect(onPreviewSaved).not.toHaveBeenCalled();

    await plantGeneration.save(jobId, "Moon Tree", "friends");
    expect(onPreviewSaved).toHaveBeenCalledTimes(1);
  });
});
