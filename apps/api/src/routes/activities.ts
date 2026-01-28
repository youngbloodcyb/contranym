import { Elysia } from "elysia";
import { z } from "zod";
import { db } from "@repo/db";
import { activities } from "@repo/db/schema";
import { eq } from "drizzle-orm";

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
  // GET /activities - List all activities
  .get("/", async () => {
    const result = await db.select().from(activities);
    return result;
  })
  // POST /activities - Create a new activity
  .post("/", async ({ body }) => {
    const parsed = createActivitySchema.parse(body);
    const [result] = await db.insert(activities).values(parsed).returning();
    return result;
  })
  // GET /activities/:id - Get a single activity
  .get("/:id", async ({ params }) => {
    const [result] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, params.id));
    if (!result) {
      return { error: "Activity not found" };
    }
    return result;
  })
  // PUT /activities/:id - Replace an activity
  .put("/:id", async ({ params, body }) => {
    const parsed = createActivitySchema.parse(body);
    const [result] = await db
      .update(activities)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(activities.id, params.id))
      .returning();
    if (!result) {
      return { error: "Activity not found" };
    }
    return result;
  })
  // PATCH /activities/:id - Partial update an activity
  .patch("/:id", async ({ params, body }) => {
    const parsed = updateActivitySchema.parse(body);
    const [result] = await db
      .update(activities)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(activities.id, params.id))
      .returning();
    if (!result) {
      return { error: "Activity not found" };
    }
    return result;
  })
  // DELETE /activities/:id - Delete an activity
  .delete("/:id", async ({ params }) => {
    const [result] = await db
      .delete(activities)
      .where(eq(activities.id, params.id))
      .returning();
    if (!result) {
      return { error: "Activity not found" };
    }
    return { success: true };
  });
