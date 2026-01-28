import { Elysia } from "elysia";
import {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
} from "../lib/services/accounts";
import {
  createAccountSchema,
  updateAccountSchema,
} from "../lib/schemas/accounts";

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
