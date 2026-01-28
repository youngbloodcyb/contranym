import { Elysia } from "elysia";
import { z } from "zod";
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from "../lib/db/contacts";

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
  .get("/", async () => {
    return getContacts();
  })
  .post("/", async ({ body }) => {
    const data = createContactSchema.parse(body);
    return createContact(data);
  })
  .get("/:id", async ({ params }) => {
    const contact = await getContactById(params.id);
    if (!contact) {
      return { error: "Contact not found" };
    }
    return contact;
  })
  .put("/:id", async ({ params, body }) => {
    const data = createContactSchema.parse(body);
    const contact = await updateContact(params.id, data);
    if (!contact) {
      return { error: "Contact not found" };
    }
    return contact;
  })
  .patch("/:id", async ({ params, body }) => {
    const data = updateContactSchema.parse(body);
    const contact = await updateContact(params.id, data);
    if (!contact) {
      return { error: "Contact not found" };
    }
    return contact;
  })
  .delete("/:id", async ({ params }) => {
    const contact = await deleteContact(params.id);
    if (!contact) {
      return { error: "Contact not found" };
    }
    return { success: true };
  });
