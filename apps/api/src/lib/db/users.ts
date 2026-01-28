import { db } from "@repo/db";
import { users } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import type { NewUser } from "@repo/db/schema";

export const getUsers = async () => {
  return db.select().from(users);
};

export const getUserById = async (id: string) => {
  const [result] = await db.select().from(users).where(eq(users.id, id));
  return result ?? null;
};

export const createUser = async (data: NewUser) => {
  const [result] = await db.insert(users).values(data).returning();
  return result;
};

export const updateUser = async (id: string, data: Partial<NewUser>) => {
  const [result] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return result ?? null;
};

export const deleteUser = async (id: string) => {
  const [result] = await db.delete(users).where(eq(users.id, id)).returning();
  return result ?? null;
};
