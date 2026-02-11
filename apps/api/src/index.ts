import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { users } from "./modules/users";
import { accounts } from "./modules/accounts";
import { contacts } from "./modules/contacts";
import { deals } from "./modules/deals";
import { activities } from "./modules/activities";
import { tasks } from "./modules/tasks";
import { notes } from "./modules/notes";
import { tags } from "./modules/tags";
import { auth } from "./auth";

const app = new Elysia()
  .use(openapi())
  .get("/", () => {
    return { message: "Hello, World!" };
  })
  .mount(auth.handler)
  .use(users)
  .use(accounts)
  .use(contacts)
  .use(deals)
  .use(activities)
  .use(tasks)
  .use(notes)
  .use(tags);

export default app;
