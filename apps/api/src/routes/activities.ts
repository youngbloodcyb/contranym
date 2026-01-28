import { Elysia, t } from "elysia";
import { db } from "@repo/db";
import { activities } from "@repo/db/schema";
import { eq } from "drizzle-orm";

const activityTypeSchema = t.Union([
  t.Literal("call"),
  t.Literal("email"),
  t.Literal("meeting"),
  t.Literal("note"),
  t.Literal("task"),
  t.Literal("demo"),
  t.Literal("proposal_sent"),
  t.Literal("contract_sent"),
  t.Literal("other"),
]);

export const activitiesRoutes = new Elysia({ prefix: "/activities" })
  // GET /activities - List all activities
  .get("/", async () => {
    const result = await db.select().from(activities);
    return result;
  })
  // POST /activities - Create a new activity
  .post(
    "/",
    async ({ body }) => {
      const [result] = await db.insert(activities).values(body).returning();
      return result;
    },
    {
      body: t.Object({
        type: activityTypeSchema,
        subject: t.String(),
        description: t.Optional(t.String()),
        accountId: t.Optional(t.String()),
        contactId: t.Optional(t.String()),
        dealId: t.Optional(t.String()),
        dueDate: t.Optional(t.String()),
        completedAt: t.Optional(t.String()),
        durationMinutes: t.Optional(t.Number()),
        ownerId: t.Optional(t.String()),
        createdById: t.Optional(t.String()),
        customFields: t.Optional(t.Record(t.String(), t.Unknown())),
      }),
    }
  )
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
  .put(
    "/:id",
    async ({ params, body }) => {
      const [result] = await db
        .update(activities)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(activities.id, params.id))
        .returning();
      if (!result) {
        return { error: "Activity not found" };
      }
      return result;
    },
    {
      body: t.Object({
        type: activityTypeSchema,
        subject: t.String(),
        description: t.Optional(t.String()),
        accountId: t.Optional(t.String()),
        contactId: t.Optional(t.String()),
        dealId: t.Optional(t.String()),
        dueDate: t.Optional(t.String()),
        completedAt: t.Optional(t.String()),
        durationMinutes: t.Optional(t.Number()),
        ownerId: t.Optional(t.String()),
        createdById: t.Optional(t.String()),
        customFields: t.Optional(t.Record(t.String(), t.Unknown())),
      }),
    }
  )
  // PATCH /activities/:id - Partial update an activity
  .patch(
    "/:id",
    async ({ params, body }) => {
      const [result] = await db
        .update(activities)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(activities.id, params.id))
        .returning();
      if (!result) {
        return { error: "Activity not found" };
      }
      return result;
    },
    {
      body: t.Object({
        type: t.Optional(activityTypeSchema),
        subject: t.Optional(t.String()),
        description: t.Optional(t.String()),
        accountId: t.Optional(t.String()),
        contactId: t.Optional(t.String()),
        dealId: t.Optional(t.String()),
        dueDate: t.Optional(t.String()),
        completedAt: t.Optional(t.String()),
        durationMinutes: t.Optional(t.Number()),
        ownerId: t.Optional(t.String()),
        createdById: t.Optional(t.String()),
        customFields: t.Optional(t.Record(t.String(), t.Unknown())),
      }),
    }
  )
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
