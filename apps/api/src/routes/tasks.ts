import { Elysia } from "elysia";
import { z } from "zod";
import { db } from "@repo/db";
import { tasks } from "@repo/db/schema";
import { eq } from "drizzle-orm";

const taskStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);

const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

const createTaskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  dueDate: z.string().optional(),
  completedAt: z.string().optional(),
  accountId: z.string().optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  assignedToId: z.string().optional(),
  createdById: z.string().optional(),
});

const updateTaskSchema = createTaskSchema.partial();

export const tasksRoutes = new Elysia({ prefix: "/tasks" })
  // GET /tasks - List all tasks
  .get("/", async () => {
    const result = await db.select().from(tasks);
    return result;
  })
  // POST /tasks - Create a new task
  .post("/", async ({ body }) => {
    const parsed = createTaskSchema.parse(body);
    const [result] = await db.insert(tasks).values(parsed).returning();
    return result;
  })
  // GET /tasks/:id - Get a single task
  .get("/:id", async ({ params }) => {
    const [result] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, params.id));
    if (!result) {
      return { error: "Task not found" };
    }
    return result;
  })
  // PUT /tasks/:id - Replace a task
  .put("/:id", async ({ params, body }) => {
    const parsed = createTaskSchema.parse(body);
    const [result] = await db
      .update(tasks)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(tasks.id, params.id))
      .returning();
    if (!result) {
      return { error: "Task not found" };
    }
    return result;
  })
  // PATCH /tasks/:id - Partial update a task
  .patch("/:id", async ({ params, body }) => {
    const parsed = updateTaskSchema.parse(body);
    const [result] = await db
      .update(tasks)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(tasks.id, params.id))
      .returning();
    if (!result) {
      return { error: "Task not found" };
    }
    return result;
  })
  // DELETE /tasks/:id - Delete a task
  .delete("/:id", async ({ params }) => {
    const [result] = await db
      .delete(tasks)
      .where(eq(tasks.id, params.id))
      .returning();
    if (!result) {
      return { error: "Task not found" };
    }
    return { success: true };
  });
