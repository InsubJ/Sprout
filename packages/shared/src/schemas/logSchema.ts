import { z } from "zod";
export const createHabitLogSchema = z.object({
  habit_id: z.string().uuid(),
  user_id: z.string().uuid(),
  note: z.string().trim().max(500).optional(),
  image_url: z.string().url().optional(),
  client_operation_id: z.string().trim().min(8).max(200).optional(),
});
