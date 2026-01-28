import { describe, expect, it } from "bun:test";
import { activities } from "./index";

const baseUrl = "http://localhost/activities";

describe("Activities Module", () => {
  let createdActivityId: string;

  it("GET / - returns activities list", async () => {
    const response = await activities.handle(new Request(baseUrl));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it("POST / - creates an activity", async () => {
    const response = await activities.handle(
      new Request(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "call",
          subject: `Test Call ${Date.now()}`,
          description: "Test call activity",
          durationMinutes: 30,
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.type).toBe("call");
    expect(data.subject).toContain("Test Call");
    expect(data.durationMinutes).toBe(30);
    expect(data.id).toBeDefined();

    createdActivityId = data.id;
  });

  it("GET /:id - returns a single activity", async () => {
    const response = await activities.handle(
      new Request(`${baseUrl}/${createdActivityId}`)
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(createdActivityId);
  });

  it("PUT /:id - replaces an activity", async () => {
    const response = await activities.handle(
      new Request(`${baseUrl}/${createdActivityId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "meeting",
          subject: `Updated Meeting ${Date.now()}`,
          durationMinutes: 60,
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.type).toBe("meeting");
    expect(data.durationMinutes).toBe(60);
  });

  it("PATCH /:id - partially updates an activity", async () => {
    const response = await activities.handle(
      new Request(`${baseUrl}/${createdActivityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "demo",
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.type).toBe("demo");
  });

  it("DELETE /:id - deletes an activity", async () => {
    const response = await activities.handle(
      new Request(`${baseUrl}/${createdActivityId}`, {
        method: "DELETE",
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("GET /:id - returns error for non-existent activity", async () => {
    const response = await activities.handle(
      new Request(`${baseUrl}/00000000-0000-0000-0000-000000000000`)
    );
    const data = await response.json();

    expect(data.error).toBe("Activity not found");
  });
});
