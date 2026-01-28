import { Elysia } from "elysia";
import { z } from "zod";
import { db } from "@repo/db";
import { users } from "@repo/db/schema";
import { eq } from "drizzle-orm";

const createUserSchema = z.object({
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateUserSchema = z.object({
  email: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const usersRoutes = new Elysia({ prefix: "/users" })
  // GET /users - List all users
  .get("/", async () => {
    const result = await db.select().from(users);
    return result;
  })
  // POST /users - Create a new user
  .post("/", async ({ body }) => {
    const parsed = createUserSchema.parse(body);
    const [result] = await db.insert(users).values(parsed).returning();
    return result;
  })
  // GET /users/:id - Get a single user
  .get("/:id", async ({ params }) => {
    const [result] = await db
      .select()
      .from(users)
      .where(eq(users.id, params.id));
    if (!result) {
      return { error: "User not found" };
    }
    return result;
  })
  // PUT /users/:id - Replace a user
  .put("/:id", async ({ params, body }) => {
    const parsed = createUserSchema.parse(body);
    const [result] = await db
      .update(users)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(users.id, params.id))
      .returning();
    if (!result) {
      return { error: "User not found" };
    }
    return result;
  })
  // PATCH /users/:id - Partial update a user
  .patch("/:id", async ({ params, body }) => {
    const parsed = updateUserSchema.parse(body);
    const [result] = await db
      .update(users)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(users.id, params.id))
      .returning();
    if (!result) {
      return { error: "User not found" };
    }
    return result;
  })
  // DELETE /users/:id - Delete a user
  .delete("/:id", async ({ params }) => {
    const [result] = await db
      .delete(users)
      .where(eq(users.id, params.id))
      .returning();
    if (!result) {
      return { error: "User not found" };
    }
    return { success: true };
  });
