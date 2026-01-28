import { Elysia, t } from "elysia";
import { db } from "@repo/db";
import { deals } from "@repo/db/schema";
import { eq } from "drizzle-orm";

const dealStageSchema = t.Union([
  t.Literal("discovery"),
  t.Literal("qualification"),
  t.Literal("proposal"),
  t.Literal("negotiation"),
  t.Literal("closed_won"),
  t.Literal("closed_lost"),
]);

export const dealsRoutes = new Elysia({ prefix: "/deals" })
  // GET /deals - List all deals
  .get("/", async () => {
    const result = await db.select().from(deals);
    return result;
  })
  // POST /deals - Create a new deal
  .post(
    "/",
    async ({ body }) => {
      const [result] = await db.insert(deals).values(body).returning();
      return result;
    },
    {
      body: t.Object({
        name: t.String(),
        accountId: t.String(),
        primaryContactId: t.Optional(t.String()),
        ownerId: t.Optional(t.String()),
        stage: t.Optional(dealStageSchema),
        amount: t.Optional(t.String()),
        currency: t.Optional(t.String()),
        probability: t.Optional(t.Number()),
        expectedCloseDate: t.Optional(t.String()),
        actualCloseDate: t.Optional(t.String()),
        leadSource: t.Optional(t.String()),
        campaignId: t.Optional(t.String()),
        description: t.Optional(t.String()),
        nextSteps: t.Optional(t.String()),
        lossReason: t.Optional(t.String()),
        customFields: t.Optional(t.Record(t.String(), t.Unknown())),
      }),
    }
  )
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
  .put(
    "/:id",
    async ({ params, body }) => {
      const [result] = await db
        .update(deals)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(deals.id, params.id))
        .returning();
      if (!result) {
        return { error: "Deal not found" };
      }
      return result;
    },
    {
      body: t.Object({
        name: t.String(),
        accountId: t.String(),
        primaryContactId: t.Optional(t.String()),
        ownerId: t.Optional(t.String()),
        stage: t.Optional(dealStageSchema),
        amount: t.Optional(t.String()),
        currency: t.Optional(t.String()),
        probability: t.Optional(t.Number()),
        expectedCloseDate: t.Optional(t.String()),
        actualCloseDate: t.Optional(t.String()),
        leadSource: t.Optional(t.String()),
        campaignId: t.Optional(t.String()),
        description: t.Optional(t.String()),
        nextSteps: t.Optional(t.String()),
        lossReason: t.Optional(t.String()),
        customFields: t.Optional(t.Record(t.String(), t.Unknown())),
      }),
    }
  )
  // PATCH /deals/:id - Partial update a deal
  .patch(
    "/:id",
    async ({ params, body }) => {
      const [result] = await db
        .update(deals)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(deals.id, params.id))
        .returning();
      if (!result) {
        return { error: "Deal not found" };
      }
      return result;
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        accountId: t.Optional(t.String()),
        primaryContactId: t.Optional(t.String()),
        ownerId: t.Optional(t.String()),
        stage: t.Optional(dealStageSchema),
        amount: t.Optional(t.String()),
        currency: t.Optional(t.String()),
        probability: t.Optional(t.Number()),
        expectedCloseDate: t.Optional(t.String()),
        actualCloseDate: t.Optional(t.String()),
        leadSource: t.Optional(t.String()),
        campaignId: t.Optional(t.String()),
        description: t.Optional(t.String()),
        nextSteps: t.Optional(t.String()),
        lossReason: t.Optional(t.String()),
        customFields: t.Optional(t.Record(t.String(), t.Unknown())),
      }),
    }
  )
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
