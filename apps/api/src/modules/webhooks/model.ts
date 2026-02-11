import { z } from "zod";
import { webhookActions, webhookObjectTypes } from "./constants";

export const webhookObjectTypeSchema = z.enum(webhookObjectTypes);
export const webhookActionSchema = z.enum(webhookActions);

export const webhookSubscriptionSchema = z.object({
  objectType: webhookObjectTypeSchema,
  eventType: webhookActionSchema,
});

export const createWebhookSchema = z.object({
  name: z.string().min(1),
  targetUrl: z.string().url(),
  secret: z.string().min(12).optional(),
  isActive: z.boolean().optional(),
  subscriptions: z.array(webhookSubscriptionSchema).min(1),
});

export const updateWebhookSchema = z.object({
  name: z.string().min(1).optional(),
  targetUrl: z.string().url().optional(),
  secret: z.string().min(12).optional(),
  isActive: z.boolean().optional(),
  subscriptions: z.array(webhookSubscriptionSchema).optional(),
});

export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;
export type WebhookSubscriptionInput = z.infer<
  typeof webhookSubscriptionSchema
>;
