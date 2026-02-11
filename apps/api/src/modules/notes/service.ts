import { db } from "@repo/db";
import { notes } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import type { NewNote } from "@repo/db/schema";
import { emitWebhookEvent } from "../webhooks/delivery";

export const getNotes = async () => {
  return db.select().from(notes);
};

export const getNoteById = async (id: string) => {
  const [result] = await db.select().from(notes).where(eq(notes.id, id));
  return result ?? null;
};

export const createNote = async (data: NewNote) => {
  const [result] = await db.insert(notes).values(data).returning();

  void emitWebhookEvent({
    objectType: "notes",
    action: "created",
    objectId: result.id,
    current: result as Record<string, unknown>,
  });

  return result;
};

export const updateNote = async (id: string, data: Partial<NewNote>) => {
  const [result] = await db
    .update(notes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(notes.id, id))
    .returning();

  if (!result) {
    return null;
  }

  void emitWebhookEvent({
    objectType: "notes",
    action: "updated",
    objectId: result.id,
    current: result as Record<string, unknown>,
    changedFields: Object.keys(data),
  });

  return result;
};

export const deleteNote = async (id: string) => {
  const [result] = await db.delete(notes).where(eq(notes.id, id)).returning();

  if (!result) {
    return null;
  }

  void emitWebhookEvent({
    objectType: "notes",
    action: "deleted",
    objectId: result.id,
    previous: result as Record<string, unknown>,
  });

  return result;
};
