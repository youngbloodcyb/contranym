import { Elysia } from "elysia";
import { z } from "zod";
import {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} from "../lib/db/activities";

const activityTypeSchema = z.enum([
  "call",
  "email",
  "meeting",
  "note",
  "task",
  "demo",
  "proposal_sent",
  "contract_sent",
  "other",
]);

const createActivitySchema = z.object({
  type: activityTypeSchema,
  subject: z.string(),
  description: z.string().optional(),
  accountId: z.string().optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  dueDate: z.string().optional(),
  completedAt: z.string().optional(),
  durationMinutes: z.number().optional(),
  ownerId: z.string().optional(),
  createdById: z.string().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

const updateActivitySchema = createActivitySchema.partial();

export const activitiesRoutes = new Elysia({ prefix: "/activities" })
  .get("/", async () => {
    return getActivities();
  })
  .post("/", async ({ body }) => {
    const data = createActivitySchema.parse(body);
    return createActivity(data);
  })
  .get("/:id", async ({ params }) => {
    const activity = await getActivityById(params.id);
    if (!activity) {
      return { error: "Activity not found" };
    }
    return activity;
  })
  .put("/:id", async ({ params, body }) => {
    const data = createActivitySchema.parse(body);
    const activity = await updateActivity(params.id, data);
    if (!activity) {
      return { error: "Activity not found" };
    }
    return activity;
  })
  .patch("/:id", async ({ params, body }) => {
    const data = updateActivitySchema.parse(body);
    const activity = await updateActivity(params.id, data);
    if (!activity) {
      return { error: "Activity not found" };
    }
    return activity;
  })
  .delete("/:id", async ({ params }) => {
    const activity = await deleteActivity(params.id);
    if (!activity) {
      return { error: "Activity not found" };
    }
    return { success: true };
  });
