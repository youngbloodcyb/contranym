import { db } from "@repo/db";
import { accounts } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import type { NewAccount } from "@repo/db/schema";
import { emitWebhookEvent } from "../webhooks/delivery";

export const getAccounts = async () => {
  return db.select().from(accounts);
};

export const getAccountById = async (id: string) => {
  const [result] = await db.select().from(accounts).where(eq(accounts.id, id));
  return result ?? null;
};

export const createAccount = async (data: NewAccount) => {
  const [result] = await db.insert(accounts).values(data).returning();

  void emitWebhookEvent({
    objectType: "accounts",
    action: "created",
    objectId: result.id,
    current: result as Record<string, unknown>,
  });

  return result;
};

export const updateAccount = async (id: string, data: Partial<NewAccount>) => {
  const [result] = await db
    .update(accounts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(accounts.id, id))
    .returning();

  if (!result) {
    return null;
  }

  void emitWebhookEvent({
    objectType: "accounts",
    action: "updated",
    objectId: result.id,
    current: result as Record<string, unknown>,
    changedFields: Object.keys(data),
  });

  return result;
};

export const deleteAccount = async (id: string) => {
  const [result] = await db
    .delete(accounts)
    .where(eq(accounts.id, id))
    .returning();

  if (!result) {
    return null;
  }

  void emitWebhookEvent({
    objectType: "accounts",
    action: "deleted",
    objectId: result.id,
    previous: result as Record<string, unknown>,
  });

  return result;
};
