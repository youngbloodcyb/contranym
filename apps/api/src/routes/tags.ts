import { Elysia } from "elysia";
import { z } from "zod";
import { db } from "@repo/db";
import { tags } from "@repo/db/schema";
import { eq } from "drizzle-orm";

const createTagSchema = z.object({
  name: z.string(),
  color: z.string().optional(),
});

const updateTagSchema = createTagSchema.partial();

export const tagsRoutes = new Elysia({ prefix: "/tags" })
  // GET /tags - List all tags
  .get("/", async () => {
    const result = await db.select().from(tags);
    return result;
  })
  // POST /tags - Create a new tag
  .post("/", async ({ body }) => {
    const parsed = createTagSchema.parse(body);
    const [result] = await db.insert(tags).values(parsed).returning();
    return result;
  })
  // GET /tags/:id - Get a single tag
  .get("/:id", async ({ params }) => {
    const [result] = await db.select().from(tags).where(eq(tags.id, params.id));
    if (!result) {
      return { error: "Tag not found" };
    }
    return result;
  })
  // PUT /tags/:id - Replace a tag
  .put("/:id", async ({ params, body }) => {
    const parsed = createTagSchema.parse(body);
    const [result] = await db
      .update(tags)
      .set(parsed)
      .where(eq(tags.id, params.id))
      .returning();
    if (!result) {
      return { error: "Tag not found" };
    }
    return result;
  })
  // PATCH /tags/:id - Partial update a tag
  .patch("/:id", async ({ params, body }) => {
    const parsed = updateTagSchema.parse(body);
    const [result] = await db
      .update(tags)
      .set(parsed)
      .where(eq(tags.id, params.id))
      .returning();
    if (!result) {
      return { error: "Tag not found" };
    }
    return result;
  })
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
