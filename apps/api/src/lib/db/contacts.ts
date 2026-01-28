import { db } from "@repo/db";
import { contacts } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import type { NewContact } from "@repo/db/schema";

export const getContacts = async () => {
  return db.select().from(contacts);
};

export const getContactById = async (id: string) => {
  const [result] = await db.select().from(contacts).where(eq(contacts.id, id));
  return result ?? null;
};

export const createContact = async (data: NewContact) => {
  const [result] = await db.insert(contacts).values(data).returning();
  return result;
};

export const updateContact = async (id: string, data: Partial<NewContact>) => {
  const [result] = await db
    .update(contacts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(contacts.id, id))
    .returning();
  return result ?? null;
};

export const deleteContact = async (id: string) => {
  const [result] = await db
    .delete(contacts)
    .where(eq(contacts.id, id))
    .returning();
  return result ?? null;
};
