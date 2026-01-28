import { Elysia } from "elysia";
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from "../lib/services/contacts";
import {
  createContactSchema,
  updateContactSchema,
} from "../lib/schemas/contacts";

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
