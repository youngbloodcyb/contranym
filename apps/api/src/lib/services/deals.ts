import { db } from "@repo/db";
import { deals } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import type { NewDeal } from "@repo/db/schema";

export const getDeals = async () => {
  return db.select().from(deals);
};

export const getDealById = async (id: string) => {
  const [result] = await db.select().from(deals).where(eq(deals.id, id));
  return result ?? null;
};

export const createDeal = async (data: NewDeal) => {
  const [result] = await db.insert(deals).values(data).returning();
  return result;
};

export const updateDeal = async (id: string, data: Partial<NewDeal>) => {
  const [result] = await db
    .update(deals)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(deals.id, id))
    .returning();
  return result ?? null;
};

export const deleteDeal = async (id: string) => {
  const [result] = await db.delete(deals).where(eq(deals.id, id)).returning();
  return result ?? null;
};
