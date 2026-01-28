import { Elysia } from "elysia";
import {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} from "../lib/services/activities";
import {
  createActivitySchema,
  updateActivitySchema,
} from "../lib/schemas/activities";

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
