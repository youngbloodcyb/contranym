import { Elysia } from "elysia";
import { z } from "zod";
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from "../lib/db/notes";

const createNoteSchema = z.object({
  content: z.string(),
  accountId: z.string().optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  createdById: z.string().optional(),
});

const updateNoteSchema = createNoteSchema.partial();

export const notesRoutes = new Elysia({ prefix: "/notes" })
  .get("/", async () => {
    return getNotes();
  })
  .post("/", async ({ body }) => {
    const data = createNoteSchema.parse(body);
    return createNote(data);
  })
  .get("/:id", async ({ params }) => {
    const note = await getNoteById(params.id);
    if (!note) {
      return { error: "Note not found" };
    }
    return note;
  })
  .put("/:id", async ({ params, body }) => {
    const data = createNoteSchema.parse(body);
    const note = await updateNote(params.id, data);
    if (!note) {
      return { error: "Note not found" };
    }
    return note;
  })
  .patch("/:id", async ({ params, body }) => {
    const data = updateNoteSchema.parse(body);
    const note = await updateNote(params.id, data);
    if (!note) {
      return { error: "Note not found" };
    }
    return note;
  })
  .delete("/:id", async ({ params }) => {
    const note = await deleteNote(params.id);
    if (!note) {
      return { error: "Note not found" };
    }
    return { success: true };
  });
