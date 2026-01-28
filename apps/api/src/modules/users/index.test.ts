import { describe, expect, it } from "bun:test";
import { users } from "./index";

const baseUrl = "http://localhost/users";

describe("Users Module", () => {
  let createdUserId: string;

  it("GET / - returns users list", async () => {
    const response = await users.handle(new Request(baseUrl));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it("POST / - creates a user", async () => {
    const response = await users.handle(
      new Request(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `test-${Date.now()}@example.com`,
          firstName: "Test",
          lastName: "User",
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.email).toContain("@example.com");
    expect(data.firstName).toBe("Test");
    expect(data.id).toBeDefined();

    createdUserId = data.id;
  });

  it("GET /:id - returns a single user", async () => {
    const response = await users.handle(
      new Request(`${baseUrl}/${createdUserId}`)
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(createdUserId);
  });

  it("PUT /:id - replaces a user", async () => {
    const response = await users.handle(
      new Request(`${baseUrl}/${createdUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `updated-${Date.now()}@example.com`,
          firstName: "Updated",
          lastName: "User",
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.firstName).toBe("Updated");
  });

  it("PATCH /:id - partially updates a user", async () => {
    const response = await users.handle(
      new Request(`${baseUrl}/${createdUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Patched",
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.firstName).toBe("Patched");
  });

  it("DELETE /:id - deletes a user", async () => {
    const response = await users.handle(
      new Request(`${baseUrl}/${createdUserId}`, {
        method: "DELETE",
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("GET /:id - returns error for non-existent user", async () => {
    const response = await users.handle(
      new Request(`${baseUrl}/00000000-0000-0000-0000-000000000000`)
    );
    const data = await response.json();

    expect(data.error).toBe("User not found");
  });
});
