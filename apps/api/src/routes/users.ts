import { Elysia } from "elysia";
import { z } from "zod";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../lib/db/users";

const createUserSchema = z.object({
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateUserSchema = createUserSchema.partial();

export const usersRoutes = new Elysia({ prefix: "/users" })
  .get("/", async () => {
    return getUsers();
  })
  .post("/", async ({ body }) => {
    const data = createUserSchema.parse(body);
    return createUser(data);
  })
  .get("/:id", async ({ params }) => {
    const user = await getUserById(params.id);
    if (!user) {
      return { error: "User not found" };
    }
    return user;
  })
  .put("/:id", async ({ params, body }) => {
    const data = createUserSchema.parse(body);
    const user = await updateUser(params.id, data);
    if (!user) {
      return { error: "User not found" };
    }
    return user;
  })
  .patch("/:id", async ({ params, body }) => {
    const data = updateUserSchema.parse(body);
    const user = await updateUser(params.id, data);
    if (!user) {
      return { error: "User not found" };
    }
    return user;
  })
  .delete("/:id", async ({ params }) => {
    const user = await deleteUser(params.id);
    if (!user) {
      return { error: "User not found" };
    }
    return { success: true };
  });
