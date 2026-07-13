export type ReflectionCategory = "Flawless Bloom" | "Steady Growth" | "Scarred Resilience";

export interface ReflectionInput {
  durationDays: number;
  witheredCount: number;
  consistencyLogs: (string | Date | { created_at: string } | boolean)[];
  rescueTimeAvgHours?: number;
  resilienceScore?: number;
  plantType?: string;
}

export interface ReflectionResult {
  category: ReflectionCategory;
  summary: string;
}
