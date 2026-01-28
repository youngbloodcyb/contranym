import { Elysia, t } from "elysia";
import { db } from "@repo/db";
import { accounts } from "@repo/db/schema";
import { eq } from "drizzle-orm";

export const accountsRoutes = new Elysia({ prefix: "/accounts" })
  // GET /accounts - List all accounts
  .get("/", async () => {
    const result = await db.select().from(accounts);
    return result;
  })
  // POST /accounts - Create a new account
  .post(
    "/",
    async ({ body }) => {
      const [result] = await db.insert(accounts).values(body).returning();
      return result;
    },
    {
      body: t.Object({
        name: t.String(),
        domain: t.Optional(t.String()),
        industry: t.Optional(t.String()),
        employeeCount: t.Optional(t.Number()),
        annualRevenue: t.Optional(t.String()),
        stage: t.Optional(
          t.Union([
            t.Literal("prospect"),
            t.Literal("qualified"),
            t.Literal("negotiation"),
            t.Literal("closed_won"),
            t.Literal("closed_lost"),
            t.Literal("churned"),
            t.Literal("active_customer"),
          ])
        ),
        description: t.Optional(t.String()),
        website: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        linkedinUrl: t.Optional(t.String()),
        ownerId: t.Optional(t.String()),
        customFields: t.Optional(t.Record(t.String(), t.Unknown())),
      }),
    }
  )
  // GET /accounts/:id - Get a single account
  .get("/:id", async ({ params }) => {
    const [result] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, params.id));
    if (!result) {
      return { error: "Account not found" };
    }
    return result;
  })
  // PUT /accounts/:id - Replace an account
  .put(
    "/:id",
    async ({ params, body }) => {
      const [result] = await db
        .update(accounts)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(accounts.id, params.id))
        .returning();
      if (!result) {
        return { error: "Account not found" };
      }
      return result;
    },
    {
      body: t.Object({
        name: t.String(),
        domain: t.Optional(t.String()),
        industry: t.Optional(t.String()),
        employeeCount: t.Optional(t.Number()),
        annualRevenue: t.Optional(t.String()),
        stage: t.Optional(
          t.Union([
            t.Literal("prospect"),
            t.Literal("qualified"),
            t.Literal("negotiation"),
            t.Literal("closed_won"),
            t.Literal("closed_lost"),
            t.Literal("churned"),
            t.Literal("active_customer"),
          ])
        ),
        description: t.Optional(t.String()),
        website: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        linkedinUrl: t.Optional(t.String()),
        ownerId: t.Optional(t.String()),
        customFields: t.Optional(t.Record(t.String(), t.Unknown())),
      }),
    }
  )
  // PATCH /accounts/:id - Partial update an account
  .patch(
    "/:id",
    async ({ params, body }) => {
      const [result] = await db
        .update(accounts)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(accounts.id, params.id))
        .returning();
      if (!result) {
        return { error: "Account not found" };
      }
      return result;
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        domain: t.Optional(t.String()),
        industry: t.Optional(t.String()),
        employeeCount: t.Optional(t.Number()),
        annualRevenue: t.Optional(t.String()),
        stage: t.Optional(
          t.Union([
            t.Literal("prospect"),
            t.Literal("qualified"),
            t.Literal("negotiation"),
            t.Literal("closed_won"),
            t.Literal("closed_lost"),
            t.Literal("churned"),
            t.Literal("active_customer"),
          ])
        ),
        description: t.Optional(t.String()),
        website: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        linkedinUrl: t.Optional(t.String()),
        ownerId: t.Optional(t.String()),
        customFields: t.Optional(t.Record(t.String(), t.Unknown())),
      }),
    }
  )
  // DELETE /accounts/:id - Delete an account
  .delete("/:id", async ({ params }) => {
    const [result] = await db
      .delete(accounts)
      .where(eq(accounts.id, params.id))
      .returning();
    if (!result) {
      return { error: "Account not found" };
    }
    return { success: true };
  });
