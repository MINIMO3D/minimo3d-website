import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage" ADD COLUMN "hero_video_id" integer;
  ALTER TABLE "homepage" ADD COLUMN "hero_button_label" varchar DEFAULT 'Sofortangebot';
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_hero_video_id_media_id_fk" FOREIGN KEY ("hero_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "homepage_hero_video_idx" ON "homepage" USING btree ("hero_video_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage" DROP CONSTRAINT "homepage_hero_video_id_media_id_fk";
  
  DROP INDEX "homepage_hero_video_idx";
  ALTER TABLE "homepage" DROP COLUMN "hero_video_id";
  ALTER TABLE "homepage" DROP COLUMN "hero_button_label";`)
}
