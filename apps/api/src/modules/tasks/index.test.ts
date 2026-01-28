import { describe, expect, it } from "bun:test";
import { tasks } from "./index";

const baseUrl = "http://localhost/tasks";

describe("Tasks Module", () => {
  let createdTaskId: string;

  it("GET / - returns tasks list", async () => {
    const response = await tasks.handle(new Request(baseUrl));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it("POST / - creates a task", async () => {
    const response = await tasks.handle(
      new Request(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Test Task ${Date.now()}`,
          description: "Test task description",
          status: "pending",
          priority: "medium",
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.title).toContain("Test Task");
    expect(data.status).toBe("pending");
    expect(data.priority).toBe("medium");
    expect(data.id).toBeDefined();

    createdTaskId = data.id;
  });

  it("GET /:id - returns a single task", async () => {
    const response = await tasks.handle(
      new Request(`${baseUrl}/${createdTaskId}`)
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(createdTaskId);
  });

  it("PUT /:id - replaces a task", async () => {
    const response = await tasks.handle(
      new Request(`${baseUrl}/${createdTaskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Updated Task ${Date.now()}`,
          status: "in_progress",
          priority: "high",
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("in_progress");
    expect(data.priority).toBe("high");
  });

  it("PATCH /:id - partially updates a task", async () => {
    const response = await tasks.handle(
      new Request(`${baseUrl}/${createdTaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("completed");
  });

  it("DELETE /:id - deletes a task", async () => {
    const response = await tasks.handle(
      new Request(`${baseUrl}/${createdTaskId}`, {
        method: "DELETE",
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("GET /:id - returns error for non-existent task", async () => {
    const response = await tasks.handle(
      new Request(`${baseUrl}/00000000-0000-0000-0000-000000000000`)
    );
    const data = await response.json();

    expect(data.error).toBe("Task not found");
  });
});
