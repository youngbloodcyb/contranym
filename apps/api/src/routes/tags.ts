import { Elysia, t } from "elysia";
import { db } from "@repo/db";
import { tags } from "@repo/db/schema";
import { eq } from "drizzle-orm";

export const tagsRoutes = new Elysia({ prefix: "/tags" })
  // GET /tags - List all tags
  .get("/", async () => {
    const result = await db.select().from(tags);
    return result;
  })
  // POST /tags - Create a new tag
  .post(
    "/",
    async ({ body }) => {
      const [result] = await db.insert(tags).values(body).returning();
      return result;
    },
    {
      body: t.Object({
        name: t.String(),
        color: t.Optional(t.String()),
      }),
    }
  )
  // GET /tags/:id - Get a single tag
  .get("/:id", async ({ params }) => {
    const [result] = await db.select().from(tags).where(eq(tags.id, params.id));
    if (!result) {
      return { error: "Tag not found" };
    }
    return result;
  })
  // PUT /tags/:id - Replace a tag
  .put(
    "/:id",
    async ({ params, body }) => {
      const [result] = await db
        .update(tags)
        .set(body)
        .where(eq(tags.id, params.id))
        .returning();
      if (!result) {
        return { error: "Tag not found" };
      }
      return result;
    },
    {
      body: t.Object({
        name: t.String(),
        color: t.Optional(t.String()),
      }),
    }
  )
  // PATCH /tags/:id - Partial update a tag
  .patch(
    "/:id",
    async ({ params, body }) => {
      const [result] = await db
        .update(tags)
        .set(body)
        .where(eq(tags.id, params.id))
        .returning();
      if (!result) {
        return { error: "Tag not found" };
      }
      return result;
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        color: t.Optional(t.String()),
      }),
    }
  )
  // DELETE /tags/:id - Delete a tag
  .delete("/:id", async ({ params }) => {
    const [result] = await db
      .delete(tags)
      .where(eq(tags.id, params.id))
      .returning();
    if (!result) {
      return { error: "Tag not found" };
    }
    return { success: true };
  });
