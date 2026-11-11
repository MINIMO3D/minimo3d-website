import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { attachOwnerPhoto, removeOwnerParagraph } from '../seed/owner'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "owner_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "owner_photo_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "owner_linkedin" varchar;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_owner_photo_id_media_id_fk" FOREIGN KEY ("owner_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_owner_photo_idx" ON "site_settings" USING btree ("owner_photo_id");`)

  // Inhaberfoto einmalig eintragen; der alte Textabschnitt weicht dem neuen Block.
  await attachOwnerPhoto(payload, req)
  await removeOwnerParagraph(payload, req)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_owner_photo_id_media_id_fk";
  
  DROP INDEX "site_settings_owner_photo_idx";
  ALTER TABLE "site_settings" DROP COLUMN "owner_title";
  ALTER TABLE "site_settings" DROP COLUMN "owner_photo_id";
  ALTER TABLE "site_settings" DROP COLUMN "owner_linkedin";`)
}
