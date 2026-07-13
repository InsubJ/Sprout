import type { GeneratedPlantSpec } from "./customPlant";

export const GENERATION_JOB_STATUSES = [
  "queued",
  "moderating",
  "planning",
  "generating",
  "validating",
  "repairing",
  "preview_ready",
  "saving",
  "completed",
  "failed",
  "cancelled",
] as const;
export type GenerationJobStatus = (typeof GENERATION_JOB_STATUSES)[number];
export type PlantProviderName = "groq" | "openrouter" | "gemini" | "deepseek" | "github_models";
export type ProviderFailureCode =
  | "rate_limited"
  | "quota_exhausted"
  | "timeout"
  | "unavailable"
  | "invalid_json"
  | "invalid_schema"
  | "moderation_rejected"
  | "configuration_missing"
  | "unknown";

export interface GenerationChecklistItem {
  id: string;
  label: string;
  status: "pending" | "active" | "complete" | "failed";
}
export interface ProviderAttempt {
  provider: PlantProviderName;
  attempt: number;
  status: "failed" | "succeeded";
  failureCode?: ProviderFailureCode;
  message?: string;
}
export interface PlantGenerationJob {
  id: string;
  userId: string;
  status: GenerationJobStatus;
  originalPrompt: string;
  sanitizedPrompt: string;
  suggestedName: string | null;
  editedName: string | null;
  currentStep: string;
  checklist: GenerationChecklistItem[];
  providerAttempts: ProviderAttempt[];
  activeProvider: PlantProviderName | null;
  attemptCount: number;
  failureCode: string | null;
  failureMessage: string | null;
  generatedSpec: GeneratedPlantSpec | null;
  customPlantId: string | null;
  creditReservationId: string;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
}
