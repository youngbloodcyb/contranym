import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { usersRoutes } from "./routes/users";
import { accountsRoutes } from "./routes/accounts";
import { contactsRoutes } from "./routes/contacts";
import { dealsRoutes } from "./routes/deals";
import { activitiesRoutes } from "./routes/activities";
import { tasksRoutes } from "./routes/tasks";
import { notesRoutes } from "./routes/notes";
import { tagsRoutes } from "./routes/tags";

const app = new Elysia()
  .use(openapi())
  .get("/", () => {
    return { message: "Hello, World!" };
  })
  .use(usersRoutes)
  .use(accountsRoutes)
  .use(contactsRoutes)
  .use(dealsRoutes)
  .use(activitiesRoutes)
  .use(tasksRoutes)
  .use(notesRoutes)
  .use(tagsRoutes);

export default app;
