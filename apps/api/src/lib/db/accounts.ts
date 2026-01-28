import { db } from "@repo/db";
import { accounts } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import type { NewAccount } from "@repo/db/schema";

export const getAccounts = async () => {
  return db.select().from(accounts);
};

export const getAccountById = async (id: string) => {
  const [result] = await db.select().from(accounts).where(eq(accounts.id, id));
  return result ?? null;
};

export const createAccount = async (data: NewAccount) => {
  const [result] = await db.insert(accounts).values(data).returning();
  return result;
};

export const updateAccount = async (id: string, data: Partial<NewAccount>) => {
  const [result] = await db
    .update(accounts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(accounts.id, id))
    .returning();
  return result ?? null;
};

export const deleteAccount = async (id: string) => {
  const [result] = await db
    .delete(accounts)
    .where(eq(accounts.id, id))
    .returning();
  return result ?? null;
};
