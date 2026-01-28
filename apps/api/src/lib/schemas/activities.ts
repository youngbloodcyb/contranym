import { z } from "zod";

export const activityTypeSchema = z.enum([
  "call",
  "email",
  "meeting",
  "note",
  "task",
  "demo",
  "proposal_sent",
  "contract_sent",
  "other",
]);

export const createActivitySchema = z.object({
  type: activityTypeSchema,
  subject: z.string(),
  description: z.string().optional(),
  accountId: z.string().optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  durationMinutes: z.number().optional(),
  ownerId: z.string().optional(),
  createdById: z.string().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export const updateActivitySchema = createActivitySchema.partial();

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
