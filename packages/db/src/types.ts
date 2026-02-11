export type {
  User,
  NewUser,
  AuthAccount,
  NewAuthAccount,
  AuthSession,
  NewAuthSession,
  AuthVerification,
  NewAuthVerification,
  Account,
  NewAccount,
  Contact,
  NewContact,
  Deal,
  NewDeal,
  Activity,
  NewActivity,
  Task,
  NewTask,
  Note,
  NewNote,
  Tag,
  NewTag,
  WebhookEndpoint,
  NewWebhookEndpoint,
  WebhookSubscription,
  NewWebhookSubscription,
  WebhookDelivery,
  NewWebhookDelivery,
} from "./schema";

// Enum types
export type {
  accountStageEnum,
  dealStageEnum,
  contactRoleEnum,
  activityTypeEnum,
  taskStatusEnum,
  taskPriorityEnum,
} from "./schema";

// Inferred enum value types
import type {
  accountStageEnum,
  dealStageEnum,
  contactRoleEnum,
  activityTypeEnum,
  taskStatusEnum,
  taskPriorityEnum,
} from "./schema";

export type AccountStage = (typeof accountStageEnum.enumValues)[number];
export type DealStage = (typeof dealStageEnum.enumValues)[number];
export type ContactRole = (typeof contactRoleEnum.enumValues)[number];
export type ActivityType = (typeof activityTypeEnum.enumValues)[number];
export type TaskStatus = (typeof taskStatusEnum.enumValues)[number];
export type TaskPriority = (typeof taskPriorityEnum.enumValues)[number];
