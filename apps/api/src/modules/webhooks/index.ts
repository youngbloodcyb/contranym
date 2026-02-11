import { Elysia } from "elysia";
import { createWebhookSchema, updateWebhookSchema } from "./model";
import {
  createWebhook,
  deleteWebhook,
  getWebhookById,
  getWebhooks,
  rotateWebhookSecret,
  updateWebhook,
} from "./service";

export const webhooks = new Elysia({ prefix: "/webhooks" })
  .get("/", async () => {
    return getWebhooks();
  })
  .post("/", async ({ body }) => {
    const data = createWebhookSchema.parse(body);
    return createWebhook(data);
  })
  .get("/:id", async ({ params }) => {
    const webhook = await getWebhookById(params.id);
    if (!webhook) {
      return { error: "Webhook not found" };
    }
    return webhook;
  })
  .patch("/:id", async ({ params, body }) => {
    const data = updateWebhookSchema.parse(body);
    const webhook = await updateWebhook(params.id, data);
    if (!webhook) {
      return { error: "Webhook not found" };
    }
    return webhook;
  })
  .post("/:id/rotate-secret", async ({ params }) => {
    const result = await rotateWebhookSecret(params.id);
    if (!result) {
      return { error: "Webhook not found" };
    }
    return result;
  })
  .delete("/:id", async ({ params }) => {
    const webhook = await deleteWebhook(params.id);
    if (!webhook) {
      return { error: "Webhook not found" };
    }
    return { success: true };
  });
