import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string(),
  color: z.string().optional(),
});

export const updateTagSchema = createTagSchema.partial();

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
