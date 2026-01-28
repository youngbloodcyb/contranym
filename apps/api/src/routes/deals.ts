import { Elysia } from "elysia";
import { z } from "zod";
import { db } from "@repo/db";
import { deals } from "@repo/db/schema";
import { eq } from "drizzle-orm";

const dealStageSchema = z.enum([
  "discovery",
  "qualification",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
]);

const createDealSchema = z.object({
  name: z.string(),
  accountId: z.string(),
  primaryContactId: z.string().optional(),
  ownerId: z.string().optional(),
  stage: dealStageSchema.optional(),
  amount: z.string().optional(),
  currency: z.string().optional(),
  probability: z.number().optional(),
  expectedCloseDate: z.string().optional(),
  actualCloseDate: z.string().optional(),
  leadSource: z.string().optional(),
  campaignId: z.string().optional(),
  description: z.string().optional(),
  nextSteps: z.string().optional(),
  lossReason: z.string().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

const updateDealSchema = createDealSchema.partial();

export const dealsRoutes = new Elysia({ prefix: "/deals" })
  // GET /deals - List all deals
  .get("/", async () => {
    const result = await db.select().from(deals);
    return result;
  })
  // POST /deals - Create a new deal
  .post("/", async ({ body }) => {
    const parsed = createDealSchema.parse(body);
    const [result] = await db.insert(deals).values(parsed).returning();
    return result;
  })
  // GET /deals/:id - Get a single deal
  .get("/:id", async ({ params }) => {
    const [result] = await db
      .select()
      .from(deals)
      .where(eq(deals.id, params.id));
    if (!result) {
      return { error: "Deal not found" };
    }
    return result;
  })
  // PUT /deals/:id - Replace a deal
  .put("/:id", async ({ params, body }) => {
    const parsed = createDealSchema.parse(body);
    const [result] = await db
      .update(deals)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(deals.id, params.id))
      .returning();
    if (!result) {
      return { error: "Deal not found" };
    }
    return result;
  })
  // PATCH /deals/:id - Partial update a deal
  .patch("/:id", async ({ params, body }) => {
    const parsed = updateDealSchema.parse(body);
    const [result] = await db
      .update(deals)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(deals.id, params.id))
      .returning();
    if (!result) {
      return { error: "Deal not found" };
    }
    return result;
  })
  // DELETE /deals/:id - Delete a deal
  .delete("/:id", async ({ params }) => {
    const [result] = await db
      .delete(deals)
      .where(eq(deals.id, params.id))
      .returning();
    if (!result) {
      return { error: "Deal not found" };
    }
    return { success: true };
  });
