import { describe, expect, it } from "bun:test";
import { tags } from "./index";

const baseUrl = "http://localhost/tags";

describe("Tags Module", () => {
  let createdTagId: string;

  it("GET / - returns tags list", async () => {
    const response = await tags.handle(new Request(baseUrl));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it("POST / - creates a tag", async () => {
    const response = await tags.handle(
      new Request(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `test-tag-${Date.now()}`,
          color: "#FF5733",
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toContain("test-tag");
    expect(data.color).toBe("#FF5733");
    expect(data.id).toBeDefined();

    createdTagId = data.id;
  });

  it("GET /:id - returns a single tag", async () => {
    const response = await tags.handle(
      new Request(`${baseUrl}/${createdTagId}`)
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(createdTagId);
  });

  it("PUT /:id - replaces a tag", async () => {
    const response = await tags.handle(
      new Request(`${baseUrl}/${createdTagId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `updated-tag-${Date.now()}`,
          color: "#00FF00",
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toContain("updated-tag");
    expect(data.color).toBe("#00FF00");
  });

  it("PATCH /:id - partially updates a tag", async () => {
    const response = await tags.handle(
      new Request(`${baseUrl}/${createdTagId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          color: "#0000FF",
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.color).toBe("#0000FF");
  });

  it("DELETE /:id - deletes a tag", async () => {
    const response = await tags.handle(
      new Request(`${baseUrl}/${createdTagId}`, {
        method: "DELETE",
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("GET /:id - returns error for non-existent tag", async () => {
    const response = await tags.handle(
      new Request(`${baseUrl}/00000000-0000-0000-0000-000000000000`)
    );
    const data = await response.json();

    expect(data.error).toBe("Tag not found");
  });
});
