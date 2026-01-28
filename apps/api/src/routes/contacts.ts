import { Elysia, t } from "elysia";
import { db } from "@repo/db";
import { contacts } from "@repo/db/schema";
import { eq } from "drizzle-orm";

const contactRoleSchema = t.Union([
  t.Literal("decision_maker"),
  t.Literal("influencer"),
  t.Literal("champion"),
  t.Literal("end_user"),
  t.Literal("executive_sponsor"),
  t.Literal("technical_buyer"),
  t.Literal("economic_buyer"),
  t.Literal("other"),
]);

export const contactsRoutes = new Elysia({ prefix: "/contacts" })
  // GET /contacts - List all contacts
  .get("/", async () => {
    const result = await db.select().from(contacts);
    return result;
  })
  // POST /contacts - Create a new contact
  .post(
    "/",
    async ({ body }) => {
      const [result] = await db.insert(contacts).values(body).returning();
      return result;
    },
    {
      body: t.Object({
        firstName: t.String(),
        lastName: t.String(),
        email: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        mobilePhone: t.Optional(t.String()),
        jobTitle: t.Optional(t.String()),
        department: t.Optional(t.String()),
        role: t.Optional(contactRoleSchema),
        accountId: t.Optional(t.String()),
        linkedinUrl: t.Optional(t.String()),
        twitterHandle: t.Optional(t.String()),
        ownerId: t.Optional(t.String()),
        emailOptIn: t.Optional(t.Boolean()),
        smsOptIn: t.Optional(t.Boolean()),
        leadSource: t.Optional(t.String()),
        customFields: t.Optional(t.Record(t.String(), t.Unknown())),
      }),
    }
  )
  // GET /contacts/:id - Get a single contact
  .get("/:id", async ({ params }) => {
    const [result] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, params.id));
    if (!result) {
      return { error: "Contact not found" };
    }
    return result;
  })
  // PUT /contacts/:id - Replace a contact
  .put(
    "/:id",
    async ({ params, body }) => {
      const [result] = await db
        .update(contacts)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(contacts.id, params.id))
        .returning();
      if (!result) {
        return { error: "Contact not found" };
      }
      return result;
    },
    {
      body: t.Object({
        firstName: t.String(),
        lastName: t.String(),
        email: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        mobilePhone: t.Optional(t.String()),
        jobTitle: t.Optional(t.String()),
        department: t.Optional(t.String()),
        role: t.Optional(contactRoleSchema),
        accountId: t.Optional(t.String()),
        linkedinUrl: t.Optional(t.String()),
        twitterHandle: t.Optional(t.String()),
        ownerId: t.Optional(t.String()),
        emailOptIn: t.Optional(t.Boolean()),
        smsOptIn: t.Optional(t.Boolean()),
        leadSource: t.Optional(t.String()),
        customFields: t.Optional(t.Record(t.String(), t.Unknown())),
      }),
    }
  )
  // PATCH /contacts/:id - Partial update a contact
  .patch(
    "/:id",
    async ({ params, body }) => {
      const [result] = await db
        .update(contacts)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(contacts.id, params.id))
        .returning();
      if (!result) {
        return { error: "Contact not found" };
      }
      return result;
    },
    {
      body: t.Object({
        firstName: t.Optional(t.String()),
        lastName: t.Optional(t.String()),
        email: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        mobilePhone: t.Optional(t.String()),
        jobTitle: t.Optional(t.String()),
        department: t.Optional(t.String()),
        role: t.Optional(contactRoleSchema),
        accountId: t.Optional(t.String()),
        linkedinUrl: t.Optional(t.String()),
        twitterHandle: t.Optional(t.String()),
        ownerId: t.Optional(t.String()),
        emailOptIn: t.Optional(t.Boolean()),
        smsOptIn: t.Optional(t.Boolean()),
        leadSource: t.Optional(t.String()),
        customFields: t.Optional(t.Record(t.String(), t.Unknown())),
      }),
    }
  )
  // DELETE /contacts/:id - Delete a contact
  .delete("/:id", async ({ params }) => {
    const [result] = await db
      .delete(contacts)
      .where(eq(contacts.id, params.id))
      .returning();
    if (!result) {
      return { error: "Contact not found" };
    }
    return { success: true };
  });
