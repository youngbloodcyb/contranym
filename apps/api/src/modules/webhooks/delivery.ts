import { createHmac, randomUUID } from "crypto";
import { db } from "@repo/db";
import {
  webhookDeliveries,
  webhookEndpoints,
  webhookSubscriptions,
} from "@repo/db/schema";
import { and, eq } from "drizzle-orm";
import {
  formatWebhookEventType,
  type WebhookAction,
  type WebhookObjectType,
} from "./constants";

type WebhookEventData = {
  object?: Record<string, unknown>;
  previous?: Record<string, unknown>;
  changedFields?: string[];
};

export type EmitWebhookEventInput = {
  objectType: WebhookObjectType;
  action: WebhookAction;
  objectId: string;
  current?: Record<string, unknown> | null;
  previous?: Record<string, unknown> | null;
  changedFields?: string[];
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
};

export const emitWebhookEvent = async ({
  objectType,
  action,
  objectId,
  current,
  previous,
  changedFields,
}: EmitWebhookEventInput) => {
  const occurredAt = new Date();
  const eventId = randomUUID();
  const eventType = formatWebhookEventType(objectType, action);

  const data: WebhookEventData = {};
  if (current) {
    data.object = current;
  }
  if (previous) {
    data.previous = previous;
  }
  if (changedFields && changedFields.length > 0) {
    data.changedFields = changedFields;
  }

  const payload = {
    eventId,
    eventType,
    objectType,
    objectId,
    occurredAt: occurredAt.toISOString(),
    data,
  };

  let targets:
    | Array<{
        endpointId: string;
        targetUrl: string;
        secret: string;
      }>
    | undefined;

  try {
    targets = await db
      .select({
        endpointId: webhookEndpoints.id,
        targetUrl: webhookEndpoints.targetUrl,
        secret: webhookEndpoints.secret,
      })
      .from(webhookSubscriptions)
      .innerJoin(
        webhookEndpoints,
        eq(webhookSubscriptions.endpointId, webhookEndpoints.id),
      )
      .where(
        and(
          eq(webhookSubscriptions.objectType, objectType),
          eq(webhookSubscriptions.eventType, action),
          eq(webhookEndpoints.isActive, true),
        ),
      );
  } catch (error) {
    console.error("Webhook target lookup failed", error);
    return;
  }

  if (!targets || targets.length === 0) {
    return;
  }

  const payloadBody = JSON.stringify(payload);

  await Promise.all(
    targets.map(async (target) => {
      const signature = createHmac("sha256", target.secret)
        .update(payloadBody)
        .digest("hex");

      let status: "success" | "failed" = "failed";
      let statusCode: number | null = null;
      let errorMessage: string | null = null;

      try {
        const response = await fetch(target.targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Contranym-Event": eventType,
            "X-Contranym-Event-Id": eventId,
            "X-Contranym-Signature": `sha256=${signature}`,
          },
          body: payloadBody,
        });

        statusCode = response.status;
        if (response.ok) {
          status = "success";
        } else {
          errorMessage = `Webhook returned ${response.status}`;
        }
      } catch (error) {
        errorMessage = getErrorMessage(error);
      }

      try {
        await db.insert(webhookDeliveries).values({
          endpointId: target.endpointId,
          eventId,
          eventType,
          objectType,
          objectId,
          payload,
          status,
          statusCode,
          error: errorMessage,
          attemptCount: 1,
          deliveredAt: new Date(),
        });
      } catch (error) {
        console.error("Failed to log webhook delivery", error);
      }
    }),
  );
};
