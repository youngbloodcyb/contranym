import { Elysia } from "elysia";
import { z } from "zod";
import { db } from "@repo/db";
import { contacts } from "@repo/db/schema";
import { eq } from "drizzle-orm";

const contactRoleSchema = z.enum([
  "decision_maker",
  "influencer",
  "champion",
  "end_user",
  "executive_sponsor",
  "technical_buyer",
  "economic_buyer",
  "other",
]);

const createContactSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  mobilePhone: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  role: contactRoleSchema.optional(),
  accountId: z.string().optional(),
  linkedinUrl: z.string().optional(),
  twitterHandle: z.string().optional(),
  ownerId: z.string().optional(),
  emailOptIn: z.boolean().optional(),
  smsOptIn: z.boolean().optional(),
  leadSource: z.string().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

const updateContactSchema = createContactSchema.partial();

export const contactsRoutes = new Elysia({ prefix: "/contacts" })
  // GET /contacts - List all contacts
  .get("/", async () => {
    const result = await db.select().from(contacts);
    return result;
  })
  // POST /contacts - Create a new contact
  .post("/", async ({ body }) => {
    const parsed = createContactSchema.parse(body);
    const [result] = await db.insert(contacts).values(parsed).returning();
    return result;
  })
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
  .put("/:id", async ({ params, body }) => {
    const parsed = createContactSchema.parse(body);
    const [result] = await db
      .update(contacts)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(contacts.id, params.id))
      .returning();
    if (!result) {
      return { error: "Contact not found" };
    }
    return result;
  })
  // PATCH /contacts/:id - Partial update a contact
  .patch("/:id", async ({ params, body }) => {
    const parsed = updateContactSchema.parse(body);
    const [result] = await db
      .update(contacts)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(contacts.id, params.id))
      .returning();
    if (!result) {
      return { error: "Contact not found" };
    }
    return result;
  })
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
