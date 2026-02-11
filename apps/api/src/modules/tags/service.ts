import { db } from "@repo/db";
import { tags } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import type { NewTag } from "@repo/db/schema";
import { emitWebhookEvent } from "../webhooks/delivery";

export const getTags = async () => {
  return db.select().from(tags);
};

export const getTagById = async (id: string) => {
  const [result] = await db.select().from(tags).where(eq(tags.id, id));
  return result ?? null;
};

export const createTag = async (data: NewTag) => {
  const [result] = await db.insert(tags).values(data).returning();

  void emitWebhookEvent({
    objectType: "tags",
    action: "created",
    objectId: result.id,
    current: result as Record<string, unknown>,
  });

  return result;
};

export const updateTag = async (id: string, data: Partial<NewTag>) => {
  const [result] = await db
    .update(tags)
    .set(data)
    .where(eq(tags.id, id))
    .returning();

  if (!result) {
    return null;
  }

  void emitWebhookEvent({
    objectType: "tags",
    action: "updated",
    objectId: result.id,
    current: result as Record<string, unknown>,
    changedFields: Object.keys(data),
  });

  return result;
};

export const deleteTag = async (id: string) => {
  const [result] = await db.delete(tags).where(eq(tags.id, id)).returning();

  if (!result) {
    return null;
  }

  void emitWebhookEvent({
    objectType: "tags",
    action: "deleted",
    objectId: result.id,
    previous: result as Record<string, unknown>,
  });

  return result;
};
