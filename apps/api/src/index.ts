import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";

const app = new Elysia()
  .use(openapi())
  .get("/", () => {
    return { message: "Hello, World!" };
  });

export default app;
