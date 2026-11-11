import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { calcFor } from '../seed/materials'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_status" AS ENUM('offen', 'bezahlt', 'fertigung', 'versendet', 'storniert');
  CREATE TABLE "materials_calc_colors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"hex" varchar
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_number" varchar NOT NULL,
  	"status" "enum_orders_status" DEFAULT 'offen',
  	"paid_at" timestamp(3) with time zone,
  	"total" numeric,
  	"customer_name" varchar,
  	"customer_email" varchar,
  	"customer_phone" varchar,
  	"address" varchar,
  	"file_name" varchar,
  	"file_id" integer,
  	"material_name" varchar,
  	"color" varchar,
  	"layer" varchar,
  	"infill" varchar,
  	"quantity" numeric,
  	"express" boolean,
  	"delivery" varchar,
  	"lead_time" varchar,
  	"customer_note" varchar,
  	"breakdown" jsonb,
  	"stripe_session_id" varchar,
  	"stripe_payment_intent" varchar,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "quotes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"token" varchar NOT NULL,
  	"file_name" varchar NOT NULL,
  	"file_id" integer,
  	"ordered" boolean DEFAULT false,
  	"metrics" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "quote_files" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "calculator" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"order_fee_gross" numeric DEFAULT 6.55,
  	"machine_rate" numeric DEFAULT 1.25,
  	"min_part_net" numeric DEFAULT 1.02,
  	"vat_percent" numeric DEFAULT 19,
  	"discount5" numeric DEFAULT 12,
  	"discount10" numeric DEFAULT 25,
  	"discount25" numeric DEFAULT 30,
  	"express_percent" numeric DEFAULT 50,
  	"express_min_gross" numeric DEFAULT 18,
  	"shipping_gross" numeric DEFAULT 4.9,
  	"free_shipping_from_gross" numeric DEFAULT 50,
  	"wall_mm" numeric DEFAULT 1.2,
  	"line_width_mm" numeric DEFAULT 0.45,
  	"speed_mm_s" numeric DEFAULT 60,
  	"seconds_per_layer" numeric DEFAULT 4,
  	"build_x" numeric DEFAULT 350,
  	"build_y" numeric DEFAULT 320,
  	"build_z" numeric DEFAULT 325,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "materials" ADD COLUMN "calc_enabled" boolean DEFAULT false;
  ALTER TABLE "materials" ADD COLUMN "calc_price_per_kg" numeric;
  ALTER TABLE "materials" ADD COLUMN "calc_density" numeric;
  ALTER TABLE "materials" ADD COLUMN "calc_time_factor" numeric DEFAULT 1;
  ALTER TABLE "materials" ADD COLUMN "calc_price_factor" numeric DEFAULT 1;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "orders_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "quotes_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "quote_files_id" integer;
  ALTER TABLE "materials_calc_colors" ADD CONSTRAINT "materials_calc_colors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_file_id_quote_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."quote_files"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quotes" ADD CONSTRAINT "quotes_file_id_quote_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."quote_files"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "materials_calc_colors_order_idx" ON "materials_calc_colors" USING btree ("_order");
  CREATE INDEX "materials_calc_colors_parent_id_idx" ON "materials_calc_colors" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");
  CREATE INDEX "orders_file_idx" ON "orders" USING btree ("file_id");
  CREATE INDEX "orders_stripe_session_id_idx" ON "orders" USING btree ("stripe_session_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE UNIQUE INDEX "quotes_token_idx" ON "quotes" USING btree ("token");
  CREATE INDEX "quotes_file_idx" ON "quotes" USING btree ("file_id");
  CREATE INDEX "quotes_updated_at_idx" ON "quotes" USING btree ("updated_at");
  CREATE INDEX "quotes_created_at_idx" ON "quotes" USING btree ("created_at");
  CREATE INDEX "quote_files_updated_at_idx" ON "quote_files" USING btree ("updated_at");
  CREATE INDEX "quote_files_created_at_idx" ON "quote_files" USING btree ("created_at");
  CREATE UNIQUE INDEX "quote_files_filename_idx" ON "quote_files" USING btree ("filename");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quotes_fk" FOREIGN KEY ("quotes_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quote_files_fk" FOREIGN KEY ("quote_files_id") REFERENCES "public"."quote_files"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_quotes_id_idx" ON "payload_locked_documents_rels" USING btree ("quotes_id");
  CREATE INDEX "payload_locked_documents_rels_quote_files_id_idx" ON "payload_locked_documents_rels" USING btree ("quote_files_id");`)

  // Bestehende Materialien: Startwerte für den Preisrechner eintragen.
  const { docs } = await payload.find({ collection: 'materials', limit: 500, depth: 0, req })
  for (const m of docs as any[]) {
    const calc = calcFor(m.name)
    if (calc.enabled) await payload.update({ collection: 'materials', id: m.id, data: { calc } as any, req })
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "materials_calc_colors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quotes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quote_files" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "calculator" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "materials_calc_colors" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "quotes" CASCADE;
  DROP TABLE "quote_files" CASCADE;
  DROP TABLE "calculator" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_orders_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_quotes_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_quote_files_fk";
  
  DROP INDEX "payload_locked_documents_rels_orders_id_idx";
  DROP INDEX "payload_locked_documents_rels_quotes_id_idx";
  DROP INDEX "payload_locked_documents_rels_quote_files_id_idx";
  ALTER TABLE "materials" DROP COLUMN "calc_enabled";
  ALTER TABLE "materials" DROP COLUMN "calc_price_per_kg";
  ALTER TABLE "materials" DROP COLUMN "calc_density";
  ALTER TABLE "materials" DROP COLUMN "calc_time_factor";
  ALTER TABLE "materials" DROP COLUMN "calc_price_factor";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "orders_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "quotes_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "quote_files_id";
  DROP TYPE "public"."enum_orders_status";`)
}
