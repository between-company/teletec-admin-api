import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUsersAndUserAreas1791323006763 implements MigrationInterface {
    name = 'UpdateUsersAndUserAreas1791323006763'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_areas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "area_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "uq_user_areas_user_area" UNIQUE ("user_id", "area_id"), CONSTRAINT "PK_d24ed021d76645eff37ef32c0b1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_user_areas_area_id" ON "user_areas"  ("area_id") `);
        await queryRunner.query(`CREATE INDEX "idx_user_areas_user_id" ON "user_areas"  ("user_id") `);
        await queryRunner.query(`ALTER TABLE "users" ADD "phone_country_code" character varying(8)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "phone" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "activated_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "is_active" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user_areas" ADD CONSTRAINT "FK_5e1ce357ce140e895e7be7964df" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_areas" ADD CONSTRAINT "FK_ef6d23d49a9557d8b96ba93f14b" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_areas" DROP CONSTRAINT "FK_ef6d23d49a9557d8b96ba93f14b"`);
        await queryRunner.query(`ALTER TABLE "user_areas" DROP CONSTRAINT "FK_5e1ce357ce140e895e7be7964df"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "is_active" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "activated_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone_country_code"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_areas_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_areas_area_id"`);
        await queryRunner.query(`DROP TABLE "user_areas"`);
    }

}
