import { describe, expect, it } from "bun:test";
import { webhooks } from "./index";

const baseUrl = "http://localhost/webhooks";

describe("Webhooks Module", () => {
  let webhookId: string;

  it("GET / - returns webhooks list", async () => {
    const response = await webhooks.handle(new Request(baseUrl));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it("POST / - creates a webhook", async () => {
    const response = await webhooks.handle(
      new Request(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Hook ${Date.now()}`,
          targetUrl: "https://example.com/webhooks",
          subscriptions: [
            { objectType: "accounts", eventType: "created" },
            { objectType: "contacts", eventType: "updated" },
          ],
        }),
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBeDefined();
    expect(data.secret).toBeDefined();
    expect(Array.isArray(data.subscriptions)).toBe(true);

    webhookId = data.id;
  });

  it("GET /:id - returns the webhook", async () => {
    const response = await webhooks.handle(
      new Request(`${baseUrl}/${webhookId}`),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(webhookId);
  });

  it("PATCH /:id - updates webhook and subscriptions", async () => {
    const response = await webhooks.handle(
      new Request(`${baseUrl}/${webhookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Updated Hook",
          subscriptions: [{ objectType: "deals", eventType: "deleted" }],
        }),
      }),
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe("Updated Hook");
    expect(data.subscriptions.length).toBe(1);
    expect(data.subscriptions[0].objectType).toBe("deals");
    expect(data.subscriptions[0].eventType).toBe("deleted");
  });

  it("POST /:id/rotate-secret - rotates secret", async () => {
    const response = await webhooks.handle(
      new Request(`${baseUrl}/${webhookId}/rotate-secret`, {
        method: "POST",
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(webhookId);
    expect(typeof data.secret).toBe("string");
  });

  it("DELETE /:id - deletes webhook", async () => {
    const response = await webhooks.handle(
      new Request(`${baseUrl}/${webhookId}`, { method: "DELETE" }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
