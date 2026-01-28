import { describe, expect, it } from "bun:test";
import { notes } from "./index";

const baseUrl = "http://localhost/notes";

describe("Notes Module", () => {
  let createdNoteId: string;

  it("GET / - returns notes list", async () => {
    const response = await notes.handle(new Request(baseUrl));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it("POST / - creates a note", async () => {
    const response = await notes.handle(
      new Request(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `Test note content ${Date.now()}`,
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.content).toContain("Test note content");
    expect(data.id).toBeDefined();

    createdNoteId = data.id;
  });

  it("GET /:id - returns a single note", async () => {
    const response = await notes.handle(
      new Request(`${baseUrl}/${createdNoteId}`)
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(createdNoteId);
  });

  it("PUT /:id - replaces a note", async () => {
    const response = await notes.handle(
      new Request(`${baseUrl}/${createdNoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `Updated note content ${Date.now()}`,
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.content).toContain("Updated note content");
  });

  it("PATCH /:id - partially updates a note", async () => {
    const response = await notes.handle(
      new Request(`${baseUrl}/${createdNoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `Patched note content ${Date.now()}`,
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.content).toContain("Patched note content");
  });

  it("DELETE /:id - deletes a note", async () => {
    const response = await notes.handle(
      new Request(`${baseUrl}/${createdNoteId}`, {
        method: "DELETE",
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("GET /:id - returns error for non-existent note", async () => {
    const response = await notes.handle(
      new Request(`${baseUrl}/00000000-0000-0000-0000-000000000000`)
    );
    const data = await response.json();

    expect(data.error).toBe("Note not found");
  });
});
