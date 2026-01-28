import { Elysia, t } from "elysia";
import { db } from "@repo/db";
import { users } from "@repo/db/schema";
import { eq } from "drizzle-orm";

export const usersRoutes = new Elysia({ prefix: "/users" })
  // GET /users - List all users
  .get("/", async () => {
    const result = await db.select().from(users);
    return result;
  })
  // POST /users - Create a new user
  .post(
    "/",
    async ({ body }) => {
      const [result] = await db.insert(users).values(body).returning();
      return result;
    },
    {
      body: t.Object({
        email: t.String(),
        firstName: t.String(),
        lastName: t.String(),
        role: t.Optional(t.String()),
        isActive: t.Optional(t.Boolean()),
      }),
    }
  )
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
  .put(
    "/:id",
    async ({ params, body }) => {
      const [result] = await db
        .update(users)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(users.id, params.id))
        .returning();
      if (!result) {
        return { error: "User not found" };
      }
      return result;
    },
    {
      body: t.Object({
        email: t.String(),
        firstName: t.String(),
        lastName: t.String(),
        role: t.Optional(t.String()),
        isActive: t.Optional(t.Boolean()),
      }),
    }
  )
  // PATCH /users/:id - Partial update a user
  .patch(
    "/:id",
    async ({ params, body }) => {
      const [result] = await db
        .update(users)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(users.id, params.id))
        .returning();
      if (!result) {
        return { error: "User not found" };
      }
      return result;
    },
    {
      body: t.Object({
        email: t.Optional(t.String()),
        firstName: t.Optional(t.String()),
        lastName: t.Optional(t.String()),
        role: t.Optional(t.String()),
        isActive: t.Optional(t.Boolean()),
      }),
    }
  )
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
