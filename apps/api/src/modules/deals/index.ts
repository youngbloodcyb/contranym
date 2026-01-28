import { Elysia } from "elysia";
import {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
} from "./service";
import { createDealSchema, updateDealSchema } from "./model";

export const deals = new Elysia({ prefix: "/deals" })
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
