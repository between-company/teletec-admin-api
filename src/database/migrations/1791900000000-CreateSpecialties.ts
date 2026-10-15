import { MigrationInterface, QueryRunner } from 'typeorm'

const SPECIALTIES = ['Iluminación', 'Audio', 'Video']

export class CreateSpecialties1791900000000 implements MigrationInterface {
  name = 'CreateSpecialties1791900000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "specialties" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(150) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_specialties_name" UNIQUE ("name"), CONSTRAINT "PK_specialties" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_specialties_is_active" ON "specialties" ("is_active")`
    )

    for (const name of SPECIALTIES) {
      await queryRunner.query(
        `INSERT INTO "specialties" ("name") VALUES ($1) ON CONFLICT ("name") DO NOTHING`,
        [name]
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_specialties_is_active"`)
    await queryRunner.query(`DROP TABLE "specialties"`)
  }
}
