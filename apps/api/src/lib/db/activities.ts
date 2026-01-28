import { db } from "@repo/db";
import { activities } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import type { NewActivity } from "@repo/db/schema";

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
  return result;
};

export const updateActivity = async (
  id: string,
  data: Partial<NewActivity>
) => {
  const [result] = await db
    .update(activities)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(activities.id, id))
    .returning();
  return result ?? null;
};

export const deleteActivity = async (id: string) => {
  const [result] = await db
    .delete(activities)
    .where(eq(activities.id, id))
    .returning();
  return result ?? null;
};
