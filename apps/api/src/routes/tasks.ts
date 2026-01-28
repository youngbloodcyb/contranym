import { Elysia } from "elysia";
import { z } from "zod";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../lib/db/tasks";

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
  .get("/", async () => {
    return getTasks();
  })
  .post("/", async ({ body }) => {
    const data = createTaskSchema.parse(body);
    return createTask(data);
  })
  .get("/:id", async ({ params }) => {
    const task = await getTaskById(params.id);
    if (!task) {
      return { error: "Task not found" };
    }
    return task;
  })
  .put("/:id", async ({ params, body }) => {
    const data = createTaskSchema.parse(body);
    const task = await updateTask(params.id, data);
    if (!task) {
      return { error: "Task not found" };
    }
    return task;
  })
  .patch("/:id", async ({ params, body }) => {
    const data = updateTaskSchema.parse(body);
    const task = await updateTask(params.id, data);
    if (!task) {
      return { error: "Task not found" };
    }
    return task;
  })
  .delete("/:id", async ({ params }) => {
    const task = await deleteTask(params.id);
    if (!task) {
      return { error: "Task not found" };
    }
    return { success: true };
  });
