import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { attachHomepageImages } from '../seed/homepageImages'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage_advantages" ADD COLUMN "image_id" integer;
  ALTER TABLE "homepage" ADD COLUMN "materials_image_id" integer;
  ALTER TABLE "homepage" ADD COLUMN "materials_image_caption" varchar;
  ALTER TABLE "homepage_advantages" ADD CONSTRAINT "homepage_advantages_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_materials_image_id_media_id_fk" FOREIGN KEY ("materials_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "homepage_advantages_image_idx" ON "homepage_advantages" USING btree ("image_id");
  CREATE INDEX "homepage_materials_image_idx" ON "homepage" USING btree ("materials_image_id");`)

  // Bestehende Startseite: mitgelieferte Bilder einmalig zuordnen.
  await attachHomepageImages(payload, req)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage_advantages" DROP CONSTRAINT "homepage_advantages_image_id_media_id_fk";
  
  ALTER TABLE "homepage" DROP CONSTRAINT "homepage_materials_image_id_media_id_fk";
  
  DROP INDEX "homepage_advantages_image_idx";
  DROP INDEX "homepage_materials_image_idx";
  ALTER TABLE "homepage_advantages" DROP COLUMN "image_id";
  ALTER TABLE "homepage" DROP COLUMN "materials_image_id";
  ALTER TABLE "homepage" DROP COLUMN "materials_image_caption";`)
}
