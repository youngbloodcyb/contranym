import { db } from "@repo/db";
import {
  authAccounts,
  authSessions,
  authVerifications,
  users,
} from "@repo/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      account: authAccounts,
      session: authSessions,
      verification: authVerifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    modelName: "users",
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
      },
      lastName: {
        type: "string",
        required: true,
      },
      role: {
        type: "string",
        input: false,
        required: false,
        defaultValue: "sales_rep",
      },
      isActive: {
        type: "boolean",
        input: false,
        required: false,
        defaultValue: true,
      },
    },
  },
  account: {
    modelName: "auth_accounts",
  },
  session: {
    modelName: "auth_sessions",
  },
  verification: {
    modelName: "auth_verifications",
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});
