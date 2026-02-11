import { db } from "@repo/db";
import { deals } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import type { NewDeal } from "@repo/db/schema";
import { emitWebhookEvent } from "../webhooks/delivery";

export const getDeals = async () => {
  return db.select().from(deals);
};

export const getDealById = async (id: string) => {
  const [result] = await db.select().from(deals).where(eq(deals.id, id));
  return result ?? null;
};

export const createDeal = async (data: NewDeal) => {
  const [result] = await db.insert(deals).values(data).returning();

  void emitWebhookEvent({
    objectType: "deals",
    action: "created",
    objectId: result.id,
    current: result as Record<string, unknown>,
  });

  return result;
};

export const updateDeal = async (id: string, data: Partial<NewDeal>) => {
  const [result] = await db
    .update(deals)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(deals.id, id))
    .returning();

  if (!result) {
    return null;
  }

  void emitWebhookEvent({
    objectType: "deals",
    action: "updated",
    objectId: result.id,
    current: result as Record<string, unknown>,
    changedFields: Object.keys(data),
  });

  return result;
};

export const deleteDeal = async (id: string) => {
  const [result] = await db.delete(deals).where(eq(deals.id, id)).returning();

  if (!result) {
    return null;
  }

  void emitWebhookEvent({
    objectType: "deals",
    action: "deleted",
    objectId: result.id,
    previous: result as Record<string, unknown>,
  });

  return result;
};
