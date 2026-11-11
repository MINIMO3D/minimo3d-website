import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_payment_method" AS ENUM('stripe', 'rechnung');
  CREATE TYPE "public"."enum_customers_type" AS ENUM('b2c', 'b2b');
  CREATE TYPE "public"."enum_customers_vat_status" AS ENUM('ungeprueft', 'gueltig', 'ungueltig');
  ALTER TYPE "public"."enum_orders_status" ADD VALUE 'rechnung' BEFORE 'bezahlt';
  CREATE TABLE "customers_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "customers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_customers_type" DEFAULT 'b2c' NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"phone" varchar,
  	"company" varchar,
  	"vat_id" varchar,
  	"vat_status" "enum_customers_vat_status" DEFAULT 'ungeprueft',
  	"vat_checked_at" timestamp(3) with time zone,
  	"discount_percent" numeric DEFAULT 0,
  	"invoice_allowed" boolean DEFAULT false,
  	"invoice_days" numeric DEFAULT 14,
  	"billing_street" varchar,
  	"billing_zip" varchar,
  	"billing_city" varchar,
  	"billing_country" varchar DEFAULT 'Deutschland',
  	"shipping_same" boolean DEFAULT true,
  	"shipping_name" varchar,
  	"shipping_street" varchar,
  	"shipping_zip" varchar,
  	"shipping_city" varchar,
  	"shipping_country" varchar DEFAULT 'Deutschland',
  	"accepted_terms_at" timestamp(3) with time zone,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  ALTER TABLE "orders" ADD COLUMN "customer_id" integer;
  ALTER TABLE "orders" ADD COLUMN "payment_method" "enum_orders_payment_method" DEFAULT 'stripe';
  ALTER TABLE "orders" ADD COLUMN "po_number" varchar;
  ALTER TABLE "orders" ADD COLUMN "cost_centre" varchar;
  ALTER TABLE "quotes" ADD COLUMN "customer_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "customers_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "customers_id" integer;
  ALTER TABLE "customers_sessions" ADD CONSTRAINT "customers_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "customers_sessions_order_idx" ON "customers_sessions" USING btree ("_order");
  CREATE INDEX "customers_sessions_parent_id_idx" ON "customers_sessions" USING btree ("_parent_id");
  CREATE INDEX "customers_updated_at_idx" ON "customers" USING btree ("updated_at");
  CREATE INDEX "customers_created_at_idx" ON "customers" USING btree ("created_at");
  CREATE UNIQUE INDEX "customers_email_idx" ON "customers" USING btree ("email");
  ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quotes" ADD CONSTRAINT "quotes_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_customers_fk" FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_customers_fk" FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id");
  CREATE INDEX "quotes_customer_idx" ON "quotes" USING btree ("customer_id");
  CREATE INDEX "payload_locked_documents_rels_customers_id_idx" ON "payload_locked_documents_rels" USING btree ("customers_id");
  CREATE INDEX "payload_preferences_rels_customers_id_idx" ON "payload_preferences_rels" USING btree ("customers_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "customers_sessions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "customers" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "customers_sessions" CASCADE;
  DROP TABLE "customers" CASCADE;
  ALTER TABLE "orders" DROP CONSTRAINT "orders_customer_id_customers_id_fk";
  
  ALTER TABLE "quotes" DROP CONSTRAINT "quotes_customer_id_customers_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_customers_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_customers_fk";
  
  ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'offen'::text;
  DROP TYPE "public"."enum_orders_status";
  CREATE TYPE "public"."enum_orders_status" AS ENUM('offen', 'bezahlt', 'fertigung', 'versendet', 'storniert');
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'offen'::"public"."enum_orders_status";
  ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."enum_orders_status" USING "status"::"public"."enum_orders_status";
  DROP INDEX "orders_customer_idx";
  DROP INDEX "quotes_customer_idx";
  DROP INDEX "payload_locked_documents_rels_customers_id_idx";
  DROP INDEX "payload_preferences_rels_customers_id_idx";
  ALTER TABLE "orders" DROP COLUMN "customer_id";
  ALTER TABLE "orders" DROP COLUMN "payment_method";
  ALTER TABLE "orders" DROP COLUMN "po_number";
  ALTER TABLE "orders" DROP COLUMN "cost_centre";
  ALTER TABLE "quotes" DROP COLUMN "customer_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "customers_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "customers_id";
  DROP TYPE "public"."enum_orders_payment_method";
  DROP TYPE "public"."enum_customers_type";
  DROP TYPE "public"."enum_customers_vat_status";`)
}
