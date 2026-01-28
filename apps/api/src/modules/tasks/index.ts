import { Elysia } from "elysia";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "./service";
import { createTaskSchema, updateTaskSchema } from "./model";

export const tasks = new Elysia({ prefix: "/tasks" })
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
