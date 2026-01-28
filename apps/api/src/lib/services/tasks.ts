import { db } from "@repo/db";
import { tasks } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import type { NewTask } from "@repo/db/schema";

export const getTasks = async () => {
  return db.select().from(tasks);
};

export const getTaskById = async (id: string) => {
  const [result] = await db.select().from(tasks).where(eq(tasks.id, id));
  return result ?? null;
};

export const createTask = async (data: NewTask) => {
  const [result] = await db.insert(tasks).values(data).returning();
  return result;
};

export const updateTask = async (id: string, data: Partial<NewTask>) => {
  const [result] = await db
    .update(tasks)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(tasks.id, id))
    .returning();
  return result ?? null;
};

export const deleteTask = async (id: string) => {
  const [result] = await db.delete(tasks).where(eq(tasks.id, id)).returning();
  return result ?? null;
};
