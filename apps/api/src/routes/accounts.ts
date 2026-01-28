import { Elysia } from "elysia";
import { z } from "zod";
import {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
} from "../lib/db/accounts";

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
  .get("/", async () => {
    return getAccounts();
  })
  .post("/", async ({ body }) => {
    const data = createAccountSchema.parse(body);
    return createAccount(data);
  })
  .get("/:id", async ({ params }) => {
    const account = await getAccountById(params.id);
    if (!account) {
      return { error: "Account not found" };
    }
    return account;
  })
  .put("/:id", async ({ params, body }) => {
    const data = createAccountSchema.parse(body);
    const account = await updateAccount(params.id, data);
    if (!account) {
      return { error: "Account not found" };
    }
    return account;
  })
  .patch("/:id", async ({ params, body }) => {
    const data = updateAccountSchema.parse(body);
    const account = await updateAccount(params.id, data);
    if (!account) {
      return { error: "Account not found" };
    }
    return account;
  })
  .delete("/:id", async ({ params }) => {
    const account = await deleteAccount(params.id);
    if (!account) {
      return { error: "Account not found" };
    }
    return { success: true };
  });
