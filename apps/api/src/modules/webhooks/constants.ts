export const webhookObjectTypes = [
  "accounts",
  "contacts",
  "deals",
  "activities",
  "tasks",
  "notes",
  "tags",
] as const;

export const webhookActions = ["created", "updated", "deleted"] as const;

export type WebhookObjectType = (typeof webhookObjectTypes)[number];
export type WebhookAction = (typeof webhookActions)[number];
export type WebhookEventType = `${WebhookObjectType}.${WebhookAction}`;

export const formatWebhookEventType = (
  objectType: WebhookObjectType,
  action: WebhookAction,
): WebhookEventType => `${objectType}.${action}`;
