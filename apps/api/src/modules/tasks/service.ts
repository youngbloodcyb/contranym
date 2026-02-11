import { db } from "@repo/db";
import { tasks } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import type { NewTask } from "@repo/db/schema";
import { emitWebhookEvent } from "../webhooks/delivery";

export const getTasks = async () => {
  return db.select().from(tasks);
};

export const getTaskById = async (id: string) => {
  const [result] = await db.select().from(tasks).where(eq(tasks.id, id));
  return result ?? null;
};

export const createTask = async (data: NewTask) => {
  const [result] = await db.insert(tasks).values(data).returning();

  void emitWebhookEvent({
    objectType: "tasks",
    action: "created",
    objectId: result.id,
    current: result as Record<string, unknown>,
  });

  return result;
};

export const updateTask = async (id: string, data: Partial<NewTask>) => {
  const [result] = await db
    .update(tasks)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning();

  if (!result) {
    return null;
  }

  void emitWebhookEvent({
    objectType: "tasks",
    action: "updated",
    objectId: result.id,
    current: result as Record<string, unknown>,
    changedFields: Object.keys(data),
  });

  return result;
};

export const deleteTask = async (id: string) => {
  const [result] = await db.delete(tasks).where(eq(tasks.id, id)).returning();

  if (!result) {
    return null;
  }

  void emitWebhookEvent({
    objectType: "tasks",
    action: "deleted",
    objectId: result.id,
    previous: result as Record<string, unknown>,
  });

  return result;
};
