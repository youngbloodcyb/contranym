ALTER TABLE "users" ADD COLUMN "name" varchar(255) DEFAULT '' NOT NULL;
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;
ALTER TABLE "users" ADD COLUMN "image" text;

CREATE TABLE "auth_accounts" (
  "id" text PRIMARY KEY NOT NULL,
  "provider_id" text NOT NULL,
  "account_id" text NOT NULL,
  "user_id" uuid NOT NULL,
  "access_token" text,
  "refresh_token" text,
  "id_token" text,
  "access_token_expires_at" timestamp,
  "refresh_token_expires_at" timestamp,
  "scope" text,
  "password" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "auth_sessions" (
  "id" text PRIMARY KEY NOT NULL,
  "token" text NOT NULL,
  "user_id" uuid NOT NULL,
  "expires_at" timestamp NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "auth_sessions_token_unique" UNIQUE("token")
);

CREATE TABLE "auth_verifications" (
  "id" text PRIMARY KEY NOT NULL,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "auth_accounts"
  ADD CONSTRAINT "auth_accounts_user_id_users_id_fk"
  FOREIGN KEY ("user_id")
  REFERENCES "public"."users"("id")
  ON DELETE cascade
  ON UPDATE no action;

ALTER TABLE "auth_sessions"
  ADD CONSTRAINT "auth_sessions_user_id_users_id_fk"
  FOREIGN KEY ("user_id")
  REFERENCES "public"."users"("id")
  ON DELETE cascade
  ON UPDATE no action;

CREATE INDEX "auth_accounts_user_id_idx" ON "auth_accounts" USING btree ("user_id");
CREATE INDEX "auth_accounts_provider_id_idx" ON "auth_accounts" USING btree ("provider_id");
CREATE INDEX "auth_accounts_account_id_idx" ON "auth_accounts" USING btree ("account_id");
CREATE INDEX "auth_sessions_user_id_idx" ON "auth_sessions" USING btree ("user_id");
CREATE INDEX "auth_verifications_identifier_idx" ON "auth_verifications" USING btree ("identifier");
CREATE INDEX "auth_verifications_value_idx" ON "auth_verifications" USING btree ("value");
