import { z } from "zod";

export const contactRoleSchema = z.enum([
  "decision_maker",
  "influencer",
  "champion",
  "end_user",
  "executive_sponsor",
  "technical_buyer",
  "economic_buyer",
  "other",
]);

export const createContactSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  mobilePhone: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  role: contactRoleSchema.optional(),
  accountId: z.string().optional(),
  linkedinUrl: z.string().optional(),
  twitterHandle: z.string().optional(),
  ownerId: z.string().optional(),
  emailOptIn: z.boolean().optional(),
  smsOptIn: z.boolean().optional(),
  leadSource: z.string().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export const updateContactSchema = createContactSchema.partial();

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
