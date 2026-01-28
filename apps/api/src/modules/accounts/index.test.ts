import { describe, expect, it } from "bun:test";
import { accounts } from "./index";

const baseUrl = "http://localhost/accounts";

describe("Accounts Module", () => {
  let createdAccountId: string;

  it("GET / - returns accounts list", async () => {
    const response = await accounts.handle(new Request(baseUrl));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it("POST / - creates an account", async () => {
    const response = await accounts.handle(
      new Request(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Test Account ${Date.now()}`,
          industry: "Technology",
          stage: "prospect",
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toContain("Test Account");
    expect(data.industry).toBe("Technology");
    expect(data.id).toBeDefined();

    createdAccountId = data.id;
  });

  it("GET /:id - returns a single account", async () => {
    const response = await accounts.handle(
      new Request(`${baseUrl}/${createdAccountId}`)
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(createdAccountId);
  });

  it("PUT /:id - replaces an account", async () => {
    const response = await accounts.handle(
      new Request(`${baseUrl}/${createdAccountId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Updated Account ${Date.now()}`,
          industry: "Finance",
          stage: "qualified",
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.industry).toBe("Finance");
    expect(data.stage).toBe("qualified");
  });

  it("PATCH /:id - partially updates an account", async () => {
    const response = await accounts.handle(
      new Request(`${baseUrl}/${createdAccountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: "negotiation",
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.stage).toBe("negotiation");
  });

  it("DELETE /:id - deletes an account", async () => {
    const response = await accounts.handle(
      new Request(`${baseUrl}/${createdAccountId}`, {
        method: "DELETE",
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("GET /:id - returns error for non-existent account", async () => {
    const response = await accounts.handle(
      new Request(`${baseUrl}/00000000-0000-0000-0000-000000000000`)
    );
    const data = await response.json();

    expect(data.error).toBe("Account not found");
  });
});
