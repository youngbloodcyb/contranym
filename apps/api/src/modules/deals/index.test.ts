import { describe, expect, it, beforeAll } from "bun:test";
import { deals } from "./index";
import { createAccount, deleteAccount } from "../accounts/service";

const baseUrl = "http://localhost/deals";

describe("Deals Module", () => {
  let createdDealId: string;
  let testAccountId: string;

  beforeAll(async () => {
    // Create a test account for deals (deals require an accountId)
    const account = await createAccount({ name: `Test Account ${Date.now()}` });
    testAccountId = account.id;
  });

  it("GET / - returns deals list", async () => {
    const response = await deals.handle(new Request(baseUrl));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it("POST / - creates a deal", async () => {
    const response = await deals.handle(
      new Request(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Test Deal ${Date.now()}`,
          accountId: testAccountId,
          stage: "discovery",
          amount: "10000",
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toContain("Test Deal");
    expect(data.stage).toBe("discovery");
    expect(data.id).toBeDefined();

    createdDealId = data.id;
  });

  it("GET /:id - returns a single deal", async () => {
    const response = await deals.handle(
      new Request(`${baseUrl}/${createdDealId}`)
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(createdDealId);
  });

  it("PUT /:id - replaces a deal", async () => {
    const response = await deals.handle(
      new Request(`${baseUrl}/${createdDealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Updated Deal ${Date.now()}`,
          accountId: testAccountId,
          stage: "proposal",
          amount: "25000",
        }),
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.stage).toBe("proposal");
    expect(data.amount).toBe("25000");
  });

  it("PATCH /:id - partially updates a deal", async () => {
    const response = await deals.handle(
      new Request(`${baseUrl}/${createdDealId}`, {
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

  it("DELETE /:id - deletes a deal", async () => {
    const response = await deals.handle(
      new Request(`${baseUrl}/${createdDealId}`, {
        method: "DELETE",
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Cleanup test account
    await deleteAccount(testAccountId);
  });

  it("GET /:id - returns error for non-existent deal", async () => {
    const response = await deals.handle(
      new Request(`${baseUrl}/00000000-0000-0000-0000-000000000000`)
    );
    const data = await response.json();

    expect(data.error).toBe("Deal not found");
  });
});
