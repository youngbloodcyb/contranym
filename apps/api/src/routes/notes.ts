import { Elysia, t } from "elysia";
import { db } from "@repo/db";
import { notes } from "@repo/db/schema";
import { eq } from "drizzle-orm";

export const notesRoutes = new Elysia({ prefix: "/notes" })
  // GET /notes - List all notes
  .get("/", async () => {
    const result = await db.select().from(notes);
    return result;
  })
  // POST /notes - Create a new note
  .post(
    "/",
    async ({ body }) => {
      const [result] = await db.insert(notes).values(body).returning();
      return result;
    },
    {
      body: t.Object({
        content: t.String(),
        accountId: t.Optional(t.String()),
        contactId: t.Optional(t.String()),
        dealId: t.Optional(t.String()),
        createdById: t.Optional(t.String()),
      }),
    }
  )
  // GET /notes/:id - Get a single note
  .get("/:id", async ({ params }) => {
    const [result] = await db
      .select()
      .from(notes)
      .where(eq(notes.id, params.id));
    if (!result) {
      return { error: "Note not found" };
    }
    return result;
  })
  // PUT /notes/:id - Replace a note
  .put(
    "/:id",
    async ({ params, body }) => {
      const [result] = await db
        .update(notes)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(notes.id, params.id))
        .returning();
      if (!result) {
        return { error: "Note not found" };
      }
      return result;
    },
    {
      body: t.Object({
        content: t.String(),
        accountId: t.Optional(t.String()),
        contactId: t.Optional(t.String()),
        dealId: t.Optional(t.String()),
        createdById: t.Optional(t.String()),
      }),
    }
  )
  // PATCH /notes/:id - Partial update a note
  .patch(
    "/:id",
    async ({ params, body }) => {
      const [result] = await db
        .update(notes)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(notes.id, params.id))
        .returning();
      if (!result) {
        return { error: "Note not found" };
      }
      return result;
    },
    {
      body: t.Object({
        content: t.Optional(t.String()),
        accountId: t.Optional(t.String()),
        contactId: t.Optional(t.String()),
        dealId: t.Optional(t.String()),
        createdById: t.Optional(t.String()),
      }),
    }
  )
  // DELETE /notes/:id - Delete a note
  .delete("/:id", async ({ params }) => {
    const [result] = await db
      .delete(notes)
      .where(eq(notes.id, params.id))
      .returning();
    if (!result) {
      return { error: "Note not found" };
    }
    return { success: true };
  });
