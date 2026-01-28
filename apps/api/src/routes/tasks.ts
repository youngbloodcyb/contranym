import { Elysia, t } from "elysia";
import { db } from "@repo/db";
import { tasks } from "@repo/db/schema";
import { eq } from "drizzle-orm";

const taskStatusSchema = t.Union([
  t.Literal("pending"),
  t.Literal("in_progress"),
  t.Literal("completed"),
  t.Literal("cancelled"),
]);

const taskPrioritySchema = t.Union([
  t.Literal("low"),
  t.Literal("medium"),
  t.Literal("high"),
  t.Literal("urgent"),
]);

export const tasksRoutes = new Elysia({ prefix: "/tasks" })
  // GET /tasks - List all tasks
  .get("/", async () => {
    const result = await db.select().from(tasks);
    return result;
  })
  // POST /tasks - Create a new task
  .post(
    "/",
    async ({ body }) => {
      const [result] = await db.insert(tasks).values(body).returning();
      return result;
    },
    {
      body: t.Object({
        title: t.String(),
        description: t.Optional(t.String()),
        status: t.Optional(taskStatusSchema),
        priority: t.Optional(taskPrioritySchema),
        dueDate: t.Optional(t.String()),
        completedAt: t.Optional(t.String()),
        accountId: t.Optional(t.String()),
        contactId: t.Optional(t.String()),
        dealId: t.Optional(t.String()),
        assignedToId: t.Optional(t.String()),
        createdById: t.Optional(t.String()),
      }),
    }
  )
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
  .put(
    "/:id",
    async ({ params, body }) => {
      const [result] = await db
        .update(tasks)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(tasks.id, params.id))
        .returning();
      if (!result) {
        return { error: "Task not found" };
      }
      return result;
    },
    {
      body: t.Object({
        title: t.String(),
        description: t.Optional(t.String()),
        status: t.Optional(taskStatusSchema),
        priority: t.Optional(taskPrioritySchema),
        dueDate: t.Optional(t.String()),
        completedAt: t.Optional(t.String()),
        accountId: t.Optional(t.String()),
        contactId: t.Optional(t.String()),
        dealId: t.Optional(t.String()),
        assignedToId: t.Optional(t.String()),
        createdById: t.Optional(t.String()),
      }),
    }
  )
  // PATCH /tasks/:id - Partial update a task
  .patch(
    "/:id",
    async ({ params, body }) => {
      const [result] = await db
        .update(tasks)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(tasks.id, params.id))
        .returning();
      if (!result) {
        return { error: "Task not found" };
      }
      return result;
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        description: t.Optional(t.String()),
        status: t.Optional(taskStatusSchema),
        priority: t.Optional(taskPrioritySchema),
        dueDate: t.Optional(t.String()),
        completedAt: t.Optional(t.String()),
        accountId: t.Optional(t.String()),
        contactId: t.Optional(t.String()),
        dealId: t.Optional(t.String()),
        assignedToId: t.Optional(t.String()),
        createdById: t.Optional(t.String()),
      }),
    }
  )
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
