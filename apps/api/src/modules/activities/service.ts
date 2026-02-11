import { db } from "@repo/db";
import { activities } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import type { NewActivity } from "@repo/db/schema";
import { emitWebhookEvent } from "../webhooks/delivery";

export const getActivities = async () => {
  return db.select().from(activities);
};

export const getActivityById = async (id: string) => {
  const [result] = await db
    .select()
    .from(activities)
    .where(eq(activities.id, id));
  return result ?? null;
};

export const createActivity = async (data: NewActivity) => {
  const [result] = await db.insert(activities).values(data).returning();

  void emitWebhookEvent({
    objectType: "activities",
    action: "created",
    objectId: result.id,
    current: result as Record<string, unknown>,
  });

  return result;
};

export const updateActivity = async (
  id: string,
  data: Partial<NewActivity>,
) => {
  const [result] = await db
    .update(activities)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(activities.id, id))
    .returning();

  if (!result) {
    return null;
  }

  void emitWebhookEvent({
    objectType: "activities",
    action: "updated",
    objectId: result.id,
    current: result as Record<string, unknown>,
    changedFields: Object.keys(data),
  });

  return result;
};

export const deleteActivity = async (id: string) => {
  const [result] = await db
    .delete(activities)
    .where(eq(activities.id, id))
    .returning();

  if (!result) {
    return null;
  }

  void emitWebhookEvent({
    objectType: "activities",
    action: "deleted",
    objectId: result.id,
    previous: result as Record<string, unknown>,
  });

  return result;
};
