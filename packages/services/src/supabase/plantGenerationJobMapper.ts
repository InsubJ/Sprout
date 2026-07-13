import type { PlantGenerationJob } from "@sprout/shared";
export function mapPlantGenerationJob(row: any): PlantGenerationJob {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    originalPrompt: row.original_prompt,
    sanitizedPrompt: row.sanitized_prompt,
    suggestedName: row.suggested_name,
    editedName: row.edited_name,
    currentStep: row.current_step,
    checklist: row.checklist,
    providerAttempts: row.provider_attempts,
    activeProvider: row.active_provider,
    attemptCount: row.attempt_count,
    failureCode: row.failure_code,
    failureMessage: row.failure_message,
    generatedSpec: row.generated_spec,
    customPlantId: row.custom_plant_id,
    creditReservationId: row.credit_reservation_id,
    createdAt: row.created_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    updatedAt: row.updated_at,
  };
}
