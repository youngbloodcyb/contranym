import { Elysia } from "elysia";
import { z } from "zod";
import { db } from "@repo/db";
import { accounts } from "@repo/db/schema";
import { eq } from "drizzle-orm";

const accountStageSchema = z.enum([
  "prospect",
  "qualified",
  "negotiation",
  "closed_won",
  "closed_lost",
  "churned",
  "active_customer",
]);

const createAccountSchema = z.object({
  name: z.string(),
  domain: z.string().optional(),
  industry: z.string().optional(),
  employeeCount: z.number().optional(),
  annualRevenue: z.string().optional(),
  stage: accountStageSchema.optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  linkedinUrl: z.string().optional(),
  ownerId: z.string().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

const updateAccountSchema = createAccountSchema.partial();

export const accountsRoutes = new Elysia({ prefix: "/accounts" })
  // GET /accounts - List all accounts
  .get("/", async () => {
    const result = await db.select().from(accounts);
    return result;
  })
  // POST /accounts - Create a new account
  .post("/", async ({ body }) => {
    const parsed = createAccountSchema.parse(body);
    const [result] = await db.insert(accounts).values(parsed).returning();
    return result;
  })
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
  .put("/:id", async ({ params, body }) => {
    const parsed = createAccountSchema.parse(body);
    const [result] = await db
      .update(accounts)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(accounts.id, params.id))
      .returning();
    if (!result) {
      return { error: "Account not found" };
    }
    return result;
  })
  // PATCH /accounts/:id - Partial update an account
  .patch("/:id", async ({ params, body }) => {
    const parsed = updateAccountSchema.parse(body);
    const [result] = await db
      .update(accounts)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(accounts.id, params.id))
      .returning();
    if (!result) {
      return { error: "Account not found" };
    }
    return result;
  })
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
