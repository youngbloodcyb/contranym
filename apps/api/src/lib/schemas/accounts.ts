import { z } from "zod";

export const accountStageSchema = z.enum([
  "prospect",
  "qualified",
  "negotiation",
  "closed_won",
  "closed_lost",
  "churned",
  "active_customer",
]);

export const createAccountSchema = z.object({
  name: z.string(),
  domain: z.string().optional(),
  industry: z.string().optional(),
  employeeCount: z.number().optional(),
  annualRevenue: z.string().optional(),
  stage: accountStageSchema.optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  linkedinUrl: z.string().optional(),
  ownerId: z.string().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export const updateAccountSchema = createAccountSchema.partial();

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
