import { Elysia } from "elysia";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "./service";
import { createUserSchema, updateUserSchema } from "./model";

export const users = new Elysia({ prefix: "/users" })
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
