import { Elysia } from "elysia";
import { z } from "zod";
import {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
} from "../lib/db/deals";

const dealStageSchema = z.enum([
  "discovery",
  "qualification",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
]);

const createDealSchema = z.object({
  name: z.string(),
  accountId: z.string(),
  primaryContactId: z.string().optional(),
  ownerId: z.string().optional(),
  stage: dealStageSchema.optional(),
  amount: z.string().optional(),
  currency: z.string().optional(),
  probability: z.number().optional(),
  expectedCloseDate: z.string().optional(),
  actualCloseDate: z.string().optional(),
  leadSource: z.string().optional(),
  campaignId: z.string().optional(),
  description: z.string().optional(),
  nextSteps: z.string().optional(),
  lossReason: z.string().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

const updateDealSchema = createDealSchema.partial();

export const dealsRoutes = new Elysia({ prefix: "/deals" })
  .get("/", async () => {
    return getDeals();
  })
  .post("/", async ({ body }) => {
    const data = createDealSchema.parse(body);
    return createDeal(data);
  })
  .get("/:id", async ({ params }) => {
    const deal = await getDealById(params.id);
    if (!deal) {
      return { error: "Deal not found" };
    }
    return deal;
  })
  .put("/:id", async ({ params, body }) => {
    const data = createDealSchema.parse(body);
    const deal = await updateDeal(params.id, data);
    if (!deal) {
      return { error: "Deal not found" };
    }
    return deal;
  })
  .patch("/:id", async ({ params, body }) => {
    const data = updateDealSchema.parse(body);
    const deal = await updateDeal(params.id, data);
    if (!deal) {
      return { error: "Deal not found" };
    }
    return deal;
  })
  .delete("/:id", async ({ params }) => {
    const deal = await deleteDeal(params.id);
    if (!deal) {
      return { error: "Deal not found" };
    }
    return { success: true };
  });
