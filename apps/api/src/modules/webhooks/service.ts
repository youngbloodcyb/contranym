import { randomBytes } from "crypto";
import { db } from "@repo/db";
import {
  webhookEndpoints,
  webhookSubscriptions,
  type NewWebhookEndpoint,
} from "@repo/db/schema";
import { eq } from "drizzle-orm";
import type {
  CreateWebhookInput,
  UpdateWebhookInput,
  WebhookSubscriptionInput,
} from "./model";

type WebhookWithSubscriptions = {
  id: string;
  name: string;
  targetUrl: string;
  secret: string;
  isActive: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  subscriptions: Array<{
    objectType: string;
    eventType: string;
  }>;
};

const generateWebhookSecret = () => randomBytes(24).toString("hex");

const normalizeSubscriptions = (subscriptions: WebhookSubscriptionInput[]) => {
  const deduped = new Map<string, WebhookSubscriptionInput>();

  for (const subscription of subscriptions) {
    const key = `${subscription.objectType}:${subscription.eventType}`;
    deduped.set(key, subscription);
  }

  return [...deduped.values()];
};

const getWebhookWithSubscriptions = async (
  id: string,
): Promise<WebhookWithSubscriptions | null> => {
  const [webhook] = await db
    .select()
    .from(webhookEndpoints)
    .where(eq(webhookEndpoints.id, id));

  if (!webhook) {
    return null;
  }

  const subscriptions = await db
    .select({
      objectType: webhookSubscriptions.objectType,
      eventType: webhookSubscriptions.eventType,
    })
    .from(webhookSubscriptions)
    .where(eq(webhookSubscriptions.endpointId, id));

  return {
    ...webhook,
    subscriptions,
  };
};

export const getWebhooks = async () => {
  const hooks = await db.select().from(webhookEndpoints);
  const withSubscriptions = await Promise.all(
    hooks.map((hook) => getWebhookWithSubscriptions(hook.id)),
  );

  return withSubscriptions.filter(
    (hook): hook is WebhookWithSubscriptions => hook !== null,
  );
};

export const getWebhookById = async (id: string) => {
  return getWebhookWithSubscriptions(id);
};

export const createWebhook = async (data: CreateWebhookInput) => {
  const [webhook] = await db
    .insert(webhookEndpoints)
    .values({
      name: data.name,
      targetUrl: data.targetUrl,
      secret: data.secret ?? generateWebhookSecret(),
      isActive: data.isActive ?? true,
    })
    .returning();

  const subscriptions = normalizeSubscriptions(data.subscriptions);

  if (subscriptions.length > 0) {
    await db.insert(webhookSubscriptions).values(
      subscriptions.map((subscription) => ({
        endpointId: webhook.id,
        objectType: subscription.objectType,
        eventType: subscription.eventType,
      })),
    );
  }

  return getWebhookWithSubscriptions(webhook.id);
};

export const updateWebhook = async (id: string, data: UpdateWebhookInput) => {
  const updateData: Partial<NewWebhookEndpoint> = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }
  if (data.targetUrl !== undefined) {
    updateData.targetUrl = data.targetUrl;
  }
  if (data.secret !== undefined) {
    updateData.secret = data.secret;
  }
  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive;
  }

  if (Object.keys(updateData).length > 0) {
    updateData.updatedAt = new Date();

    const [result] = await db
      .update(webhookEndpoints)
      .set(updateData)
      .where(eq(webhookEndpoints.id, id))
      .returning();

    if (!result) {
      return null;
    }
  } else {
    const existing = await getWebhookById(id);
    if (!existing) {
      return null;
    }
  }

  if (data.subscriptions !== undefined) {
    await db
      .delete(webhookSubscriptions)
      .where(eq(webhookSubscriptions.endpointId, id));

    const subscriptions = normalizeSubscriptions(data.subscriptions);

    if (subscriptions.length > 0) {
      await db.insert(webhookSubscriptions).values(
        subscriptions.map((subscription) => ({
          endpointId: id,
          objectType: subscription.objectType,
          eventType: subscription.eventType,
        })),
      );
    }
  }

  return getWebhookWithSubscriptions(id);
};

export const rotateWebhookSecret = async (id: string) => {
  const secret = generateWebhookSecret();

  const [result] = await db
    .update(webhookEndpoints)
    .set({ secret, updatedAt: new Date() })
    .where(eq(webhookEndpoints.id, id))
    .returning();

  if (!result) {
    return null;
  }

  return { id: result.id, secret };
};

export const deleteWebhook = async (id: string) => {
  const [result] = await db
    .delete(webhookEndpoints)
    .where(eq(webhookEndpoints.id, id))
    .returning();

  return result ?? null;
};
