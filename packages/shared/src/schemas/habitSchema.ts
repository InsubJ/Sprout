import { z } from "zod";
export const habitFrequencySchema = z.enum([
  "twice_daily",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "flexible",
]);
export const difficultyTierSchema = z.enum(["common", "uncommon", "rare", "mythical"]);
export const habitStatusSchema = z.enum(["healthy", "withered", "completed"]);
const flexibleRulesSchema = z
  .object({ days_required: z.number().int().positive(), days_total: z.number().int().positive() })
  .refine((value) => value.days_required <= value.days_total, {
    message: "Required days cannot exceed total days",
  });
const habitInputSchema = z.object({
  user_id: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  plant_type: z.string().max(50).optional(),
  difficulty_tier: difficultyTierSchema.optional(),
  frequency: habitFrequencySchema.default("daily"),
  flexible_rules: flexibleRulesSchema.nullable().optional(),
  target_waterings: z.number().int().positive().optional(),
  wither_threshold: z.number().int().positive().optional(),
  is_public: z.boolean().optional(),
  hide_name: z.boolean().optional(),
  hide_description: z.boolean().optional(),
});
export const createHabitSchema = habitInputSchema.superRefine((value, context) => {
  if (value.frequency === "flexible" && !value.flexible_rules)
    context.addIssue({
      code: "custom",
      path: ["flexible_rules"],
      message: "Flexible rules are required",
    });
});
export const updateHabitSchema = habitInputSchema.omit({ user_id: true }).partial();
