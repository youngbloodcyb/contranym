import { Elysia } from "elysia";
import { z } from "zod";
import {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
} from "../lib/services/tags";

const createTagSchema = z.object({
  name: z.string(),
  color: z.string().optional(),
});

const updateTagSchema = createTagSchema.partial();

export const tagsRoutes = new Elysia({ prefix: "/tags" })
  .get("/", async () => {
    return getTags();
  })
  .post("/", async ({ body }) => {
    const data = createTagSchema.parse(body);
    return createTag(data);
  })
  .get("/:id", async ({ params }) => {
    const tag = await getTagById(params.id);
    if (!tag) {
      return { error: "Tag not found" };
    }
    return tag;
  })
  .put("/:id", async ({ params, body }) => {
    const data = createTagSchema.parse(body);
    const tag = await updateTag(params.id, data);
    if (!tag) {
      return { error: "Tag not found" };
    }
    return tag;
  })
  .patch("/:id", async ({ params, body }) => {
    const data = updateTagSchema.parse(body);
    const tag = await updateTag(params.id, data);
    if (!tag) {
      return { error: "Tag not found" };
    }
    return tag;
  })
  .delete("/:id", async ({ params }) => {
    const tag = await deleteTag(params.id);
    if (!tag) {
      return { error: "Tag not found" };
    }
    return { success: true };
  });
