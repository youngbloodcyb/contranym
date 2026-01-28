import { z } from "zod";

export const dealStageSchema = z.enum([
  "discovery",
  "qualification",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
]);

export const createDealSchema = z.object({
  name: z.string(),
  accountId: z.string(),
  primaryContactId: z.string().optional(),
  ownerId: z.string().optional(),
  stage: dealStageSchema.optional(),
  amount: z.string().optional(),
  currency: z.string().optional(),
  probability: z.number().optional(),
  expectedCloseDate: z.coerce.date().optional(),
  actualCloseDate: z.coerce.date().optional(),
  leadSource: z.string().optional(),
  campaignId: z.string().optional(),
  description: z.string().optional(),
  nextSteps: z.string().optional(),
  lossReason: z.string().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export const updateDealSchema = createDealSchema.partial();

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
