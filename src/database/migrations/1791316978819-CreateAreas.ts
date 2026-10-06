import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAreas1791316978819 implements MigrationInterface {
    name = 'CreateAreas1791316978819'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "areas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(150) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_8c2ad80240e18fcac9e7c526311" UNIQUE ("name"), CONSTRAINT "PK_5110493f6342f34c978c084d0d6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_89dee4993762736b8d5d052da6" ON "areas"  ("is_active") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_89dee4993762736b8d5d052da6"`);
        await queryRunner.query(`DROP TABLE "areas"`);
    }

}
