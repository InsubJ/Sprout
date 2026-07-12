import { z } from 'zod';
export const profileSchema = z.object({ id: z.string().uuid(), username: z.string().trim().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/), display_name: z.string().trim().max(100).nullable(), avatar_url: z.string().url().nullable().or(z.literal('')), created_at: z.string().datetime() });
