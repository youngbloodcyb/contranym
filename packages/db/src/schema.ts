import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  pgEnum,
  jsonb,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// ENUMS
// ============================================================================

export const accountStageEnum = pgEnum("account_stage", [
  "prospect",
  "qualified",
  "negotiation",
  "closed_won",
  "closed_lost",
  "churned",
  "active_customer",
]);

export const dealStageEnum = pgEnum("deal_stage", [
  "discovery",
  "qualification",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
]);

export const contactRoleEnum = pgEnum("contact_role", [
  "decision_maker",
  "influencer",
  "champion",
  "end_user",
  "executive_sponsor",
  "technical_buyer",
  "economic_buyer",
  "other",
]);

export const activityTypeEnum = pgEnum("activity_type", [
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

export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

// ============================================================================
// USERS (CRM Users / Sales Reps)
// ============================================================================

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  role: varchar("role", { length: 50 }).default("sales_rep"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// ACCOUNTS / COMPANIES
// ============================================================================

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    domain: varchar("domain", { length: 255 }), // company website domain
    industry: varchar("industry", { length: 100 }),
    employeeCount: integer("employee_count"),
    annualRevenue: decimal("annual_revenue", { precision: 15, scale: 2 }),
    stage: accountStageEnum("stage").default("prospect").notNull(),

    // Metadata
    description: text("description"),
    website: text("website"),
    phone: varchar("phone", { length: 50 }),
    linkedinUrl: text("linkedin_url"),

    // Ownership
    ownerId: uuid("owner_id").references(() => users.id),

    // Flexible custom fields
    customFields: jsonb("custom_fields").$type<Record<string, unknown>>(),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("accounts_owner_idx").on(table.ownerId),
    index("accounts_stage_idx").on(table.stage),
    index("accounts_industry_idx").on(table.industry),
  ],
);

// ============================================================================
// CONTACTS
// ============================================================================

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    mobilePhone: varchar("mobile_phone", { length: 50 }),
    jobTitle: varchar("job_title", { length: 150 }),
    department: varchar("department", { length: 100 }),
    role: contactRoleEnum("role").default("other"),

    // Associated account
    accountId: uuid("account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),

    // Social
    linkedinUrl: text("linkedin_url"),
    twitterHandle: varchar("twitter_handle", { length: 100 }),

    // Ownership
    ownerId: uuid("owner_id").references(() => users.id),

    // Opt-in/consent
    emailOptIn: boolean("email_opt_in").default(true),
    smsOptIn: boolean("sms_opt_in").default(false),

    // Lead source tracking
    leadSource: varchar("lead_source", { length: 100 }),

    // Flexible custom fields
    customFields: jsonb("custom_fields").$type<Record<string, unknown>>(),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("contacts_account_idx").on(table.accountId),
    index("contacts_owner_idx").on(table.ownerId),
    index("contacts_email_idx").on(table.email),
  ],
);

// ============================================================================
// DEALS / OPPORTUNITIES
// ============================================================================

export const deals = pgTable(
  "deals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    accountId: uuid("account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    primaryContactId: uuid("primary_contact_id").references(() => contacts.id, {
      onDelete: "set null",
    }),
    ownerId: uuid("owner_id").references(() => users.id),

    // Deal details
    stage: dealStageEnum("stage").default("discovery").notNull(),
    amount: decimal("amount", { precision: 15, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    probability: integer("probability").default(0), // 0-100%
    expectedCloseDate: timestamp("expected_close_date"),
    actualCloseDate: timestamp("actual_close_date"),

    // Source tracking
    leadSource: varchar("lead_source", { length: 100 }),
    campaignId: uuid("campaign_id"),

    // Notes
    description: text("description"),
    nextSteps: text("next_steps"),
    lossReason: text("loss_reason"),

    customFields: jsonb("custom_fields").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("deals_account_idx").on(table.accountId),
    index("deals_owner_idx").on(table.ownerId),
    index("deals_stage_idx").on(table.stage),
    index("deals_close_date_idx").on(table.expectedCloseDate),
  ],
);

// ============================================================================
// DEAL CONTACTS (Many-to-many: contacts involved in a deal)
// ============================================================================

export const dealContacts = pgTable(
  "deal_contacts",
  {
    dealId: uuid("deal_id")
      .references(() => deals.id, { onDelete: "cascade" })
      .notNull(),
    contactId: uuid("contact_id")
      .references(() => contacts.id, { onDelete: "cascade" })
      .notNull(),
    role: contactRoleEnum("role").default("other"),
    isPrimary: boolean("is_primary").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.dealId, table.contactId] })],
);

// ============================================================================
// ACTIVITIES (Calls, Emails, Meetings, Notes)
// ============================================================================

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: activityTypeEnum("type").notNull(),
    subject: varchar("subject", { length: 255 }).notNull(),
    description: text("description"),

    // Polymorphic association
    accountId: uuid("account_id").references(() => accounts.id, {
      onDelete: "cascade",
    }),
    contactId: uuid("contact_id").references(() => contacts.id, {
      onDelete: "cascade",
    }),
    dealId: uuid("deal_id").references(() => deals.id, { onDelete: "cascade" }),

    // Activity details
    dueDate: timestamp("due_date"),
    completedAt: timestamp("completed_at"),
    durationMinutes: integer("duration_minutes"),

    // Ownership
    ownerId: uuid("owner_id").references(() => users.id),
    createdById: uuid("created_by_id").references(() => users.id),

    customFields: jsonb("custom_fields").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("activities_account_idx").on(table.accountId),
    index("activities_contact_idx").on(table.contactId),
    index("activities_deal_idx").on(table.dealId),
    index("activities_owner_idx").on(table.ownerId),
    index("activities_type_idx").on(table.type),
  ],
);

// ============================================================================
// TASKS
// ============================================================================

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: taskStatusEnum("status").default("pending").notNull(),
    priority: taskPriorityEnum("priority").default("medium").notNull(),
    dueDate: timestamp("due_date"),
    completedAt: timestamp("completed_at"),

    // Associations
    accountId: uuid("account_id").references(() => accounts.id, {
      onDelete: "cascade",
    }),
    contactId: uuid("contact_id").references(() => contacts.id, {
      onDelete: "cascade",
    }),
    dealId: uuid("deal_id").references(() => deals.id, { onDelete: "cascade" }),

    // Ownership
    assignedToId: uuid("assigned_to_id").references(() => users.id),
    createdById: uuid("created_by_id").references(() => users.id),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("tasks_assigned_to_idx").on(table.assignedToId),
    index("tasks_status_idx").on(table.status),
    index("tasks_due_date_idx").on(table.dueDate),
  ],
);

// ============================================================================
// NOTES (Standalone notes on any entity)
// ============================================================================

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    content: text("content").notNull(),

    // Polymorphic association
    accountId: uuid("account_id").references(() => accounts.id, {
      onDelete: "cascade",
    }),
    contactId: uuid("contact_id").references(() => contacts.id, {
      onDelete: "cascade",
    }),
    dealId: uuid("deal_id").references(() => deals.id, { onDelete: "cascade" }),

    createdById: uuid("created_by_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("notes_account_idx").on(table.accountId),
    index("notes_contact_idx").on(table.contactId),
    index("notes_deal_idx").on(table.dealId),
  ],
);

// ============================================================================
// TAGS (Flexible tagging system)
// ============================================================================

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  color: varchar("color", { length: 7 }), // hex color
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accountTags = pgTable(
  "account_tags",
  {
    accountId: uuid("account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.accountId, table.tagId] })],
);

export const contactTags = pgTable(
  "contact_tags",
  {
    contactId: uuid("contact_id")
      .references(() => contacts.id, { onDelete: "cascade" })
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.contactId, table.tagId] })],
);

export const dealTags = pgTable(
  "deal_tags",
  {
    dealId: uuid("deal_id")
      .references(() => deals.id, { onDelete: "cascade" })
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.dealId, table.tagId] })],
);

// ============================================================================
// WEBHOOKS
// ============================================================================

export const webhookEndpoints = pgTable(
  "webhook_endpoints",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    targetUrl: text("target_url").notNull(),
    secret: varchar("secret", { length: 255 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("webhook_endpoints_active_idx").on(table.isActive)],
);

export const webhookSubscriptions = pgTable(
  "webhook_subscriptions",
  {
    endpointId: uuid("endpoint_id")
      .references(() => webhookEndpoints.id, { onDelete: "cascade" })
      .notNull(),
    objectType: varchar("object_type", { length: 50 }).notNull(),
    eventType: varchar("event_type", { length: 30 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.endpointId, table.objectType, table.eventType],
    }),
    index("webhook_subscriptions_lookup_idx").on(
      table.objectType,
      table.eventType,
    ),
  ],
);

export const webhookDeliveries = pgTable(
  "webhook_deliveries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    endpointId: uuid("endpoint_id")
      .references(() => webhookEndpoints.id, { onDelete: "cascade" })
      .notNull(),
    eventId: uuid("event_id").notNull(),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    objectType: varchar("object_type", { length: 50 }).notNull(),
    objectId: varchar("object_id", { length: 255 }).notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    status: varchar("status", { length: 20 }).notNull(),
    statusCode: integer("status_code"),
    error: text("error"),
    attemptCount: integer("attempt_count").default(1).notNull(),
    deliveredAt: timestamp("delivered_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("webhook_deliveries_endpoint_idx").on(table.endpointId),
    index("webhook_deliveries_event_idx").on(table.eventId),
    index("webhook_deliveries_created_idx").on(table.createdAt),
  ],
);

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  ownedAccounts: many(accounts),
  ownedContacts: many(contacts),
  ownedDeals: many(deals),
  assignedTasks: many(tasks),
  activities: many(activities),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  owner: one(users, {
    fields: [accounts.ownerId],
    references: [users.id],
  }),
  contacts: many(contacts),
  deals: many(deals),
  activities: many(activities),
  tasks: many(tasks),
  notes: many(notes),
  tags: many(accountTags),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  account: one(accounts, {
    fields: [contacts.accountId],
    references: [accounts.id],
  }),
  owner: one(users, {
    fields: [contacts.ownerId],
    references: [users.id],
  }),
  dealContacts: many(dealContacts),
  activities: many(activities),
  tasks: many(tasks),
  notes: many(notes),
  tags: many(contactTags),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  account: one(accounts, {
    fields: [deals.accountId],
    references: [accounts.id],
  }),
  primaryContact: one(contacts, {
    fields: [deals.primaryContactId],
    references: [contacts.id],
  }),
  owner: one(users, {
    fields: [deals.ownerId],
    references: [users.id],
  }),
  contacts: many(dealContacts),
  activities: many(activities),
  tasks: many(tasks),
  notes: many(notes),
  tags: many(dealTags),
}));

export const dealContactsRelations = relations(dealContacts, ({ one }) => ({
  deal: one(deals, {
    fields: [dealContacts.dealId],
    references: [deals.id],
  }),
  contact: one(contacts, {
    fields: [dealContacts.contactId],
    references: [contacts.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  account: one(accounts, {
    fields: [activities.accountId],
    references: [accounts.id],
  }),
  contact: one(contacts, {
    fields: [activities.contactId],
    references: [contacts.id],
  }),
  deal: one(deals, {
    fields: [activities.dealId],
    references: [deals.id],
  }),
  owner: one(users, {
    fields: [activities.ownerId],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [activities.createdById],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  account: one(accounts, {
    fields: [tasks.accountId],
    references: [accounts.id],
  }),
  contact: one(contacts, {
    fields: [tasks.contactId],
    references: [contacts.id],
  }),
  deal: one(deals, {
    fields: [tasks.dealId],
    references: [deals.id],
  }),
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
  }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  account: one(accounts, {
    fields: [notes.accountId],
    references: [accounts.id],
  }),
  contact: one(contacts, {
    fields: [notes.contactId],
    references: [contacts.id],
  }),
  deal: one(deals, {
    fields: [notes.dealId],
    references: [deals.id],
  }),
  createdBy: one(users, {
    fields: [notes.createdById],
    references: [users.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  accounts: many(accountTags),
  contacts: many(contactTags),
  deals: many(dealTags),
}));

export const webhookEndpointsRelations = relations(
  webhookEndpoints,
  ({ many }) => ({
    subscriptions: many(webhookSubscriptions),
    deliveries: many(webhookDeliveries),
  }),
);

export const webhookSubscriptionsRelations = relations(
  webhookSubscriptions,
  ({ one }) => ({
    endpoint: one(webhookEndpoints, {
      fields: [webhookSubscriptions.endpointId],
      references: [webhookEndpoints.id],
    }),
  }),
);

export const webhookDeliveriesRelations = relations(
  webhookDeliveries,
  ({ one }) => ({
    endpoint: one(webhookEndpoints, {
      fields: [webhookDeliveries.endpointId],
      references: [webhookEndpoints.id],
    }),
  }),
);

// ============================================================================
// TYPE EXPORTS (for use in your application)
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;

export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type WebhookEndpoint = typeof webhookEndpoints.$inferSelect;
export type NewWebhookEndpoint = typeof webhookEndpoints.$inferInsert;

export type WebhookSubscription = typeof webhookSubscriptions.$inferSelect;
export type NewWebhookSubscription = typeof webhookSubscriptions.$inferInsert;

export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type NewWebhookDelivery = typeof webhookDeliveries.$inferInsert;
