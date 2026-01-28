import { describe, expect, it } from "bun:test";
import { contacts } from "./index";

const baseUrl = "http://localhost/contacts";

describe("Contacts Module", () => {
  let createdContactId: string;

  it("GET / - returns contacts list", async () => {
    const response = await contacts.handle(new Request(baseUrl));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it("POST / - creates a contact", async () => {
    const response = await contacts.handle(
      new Request(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "John",
          lastName: "Doe",
          email: `john.doe-${Date.now()}@example.com`,
          jobTitle: "CEO",
          role: "decision_maker",
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.firstName).toBe("John");
    expect(data.lastName).toBe("Doe");
    expect(data.role).toBe("decision_maker");
    expect(data.id).toBeDefined();

    createdContactId = data.id;
  });

  it("GET /:id - returns a single contact", async () => {
    const response = await contacts.handle(
      new Request(`${baseUrl}/${createdContactId}`)
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(createdContactId);
  });

  it("PUT /:id - replaces a contact", async () => {
    const response = await contacts.handle(
      new Request(`${baseUrl}/${createdContactId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Jane",
          lastName: "Smith",
          email: `jane.smith-${Date.now()}@example.com`,
          role: "influencer",
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.firstName).toBe("Jane");
    expect(data.role).toBe("influencer");
  });

  it("PATCH /:id - partially updates a contact", async () => {
    const response = await contacts.handle(
      new Request(`${baseUrl}/${createdContactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: "CTO",
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.jobTitle).toBe("CTO");
  });

  it("DELETE /:id - deletes a contact", async () => {
    const response = await contacts.handle(
      new Request(`${baseUrl}/${createdContactId}`, {
        method: "DELETE",
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("GET /:id - returns error for non-existent contact", async () => {
    const response = await contacts.handle(
      new Request(`${baseUrl}/00000000-0000-0000-0000-000000000000`)
    );
    const data = await response.json();

    expect(data.error).toBe("Contact not found");
  });
});
