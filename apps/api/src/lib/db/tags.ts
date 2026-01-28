import { db } from "@repo/db";
import { tags } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import type { NewTag } from "@repo/db/schema";

export const getTags = async () => {
  return db.select().from(tags);
};

export const getTagById = async (id: string) => {
  const [result] = await db.select().from(tags).where(eq(tags.id, id));
  return result ?? null;
};

export const createTag = async (data: NewTag) => {
  const [result] = await db.insert(tags).values(data).returning();
  return result;
};

export const updateTag = async (id: string, data: Partial<NewTag>) => {
  const [result] = await db
    .update(tags)
    .set(data)
    .where(eq(tags.id, id))
    .returning();
  return result ?? null;
};

export const deleteTag = async (id: string) => {
  const [result] = await db.delete(tags).where(eq(tags.id, id)).returning();
  return result ?? null;
};
