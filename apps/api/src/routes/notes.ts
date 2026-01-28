import { Elysia } from "elysia";
import { z } from "zod";
import { db } from "@repo/db";
import { notes } from "@repo/db/schema";
import { eq } from "drizzle-orm";

const createNoteSchema = z.object({
  content: z.string(),
  accountId: z.string().optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  createdById: z.string().optional(),
});

const updateNoteSchema = createNoteSchema.partial();

export const notesRoutes = new Elysia({ prefix: "/notes" })
  // GET /notes - List all notes
  .get("/", async () => {
    const result = await db.select().from(notes);
    return result;
  })
  // POST /notes - Create a new note
  .post("/", async ({ body }) => {
    const parsed = createNoteSchema.parse(body);
    const [result] = await db.insert(notes).values(parsed).returning();
    return result;
  })
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
  .put("/:id", async ({ params, body }) => {
    const parsed = createNoteSchema.parse(body);
    const [result] = await db
      .update(notes)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(notes.id, params.id))
      .returning();
    if (!result) {
      return { error: "Note not found" };
    }
    return result;
  })
  // PATCH /notes/:id - Partial update a note
  .patch("/:id", async ({ params, body }) => {
    const parsed = updateNoteSchema.parse(body);
    const [result] = await db
      .update(notes)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(notes.id, params.id))
      .returning();
    if (!result) {
      return { error: "Note not found" };
    }
    return result;
  })
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
