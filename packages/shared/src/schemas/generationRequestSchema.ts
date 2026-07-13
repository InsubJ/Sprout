import { z } from "zod";
export const generationRequestSchema = z
  .object({ requestId: z.string().uuid(), prompt: z.string().trim().min(3).max(1000) })
  .strict();
export const saveGeneratedPlantRequestSchema = z
  .object({
    jobId: z.string().uuid(),
    displayName: z.string().trim().min(1).max(60),
    visibility: z.enum(["friends", "private"]).default("friends"),
  })
  .strict();
