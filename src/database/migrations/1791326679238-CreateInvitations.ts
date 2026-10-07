import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInvitations1791326679238 implements MigrationInterface {
    name = 'CreateInvitations1791326679238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "token_hash" character varying(64) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used_at" TIMESTAMP WITH TIME ZONE, "revoked_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, CONSTRAINT "PK_5dec98cfdfd562e4ad3648bbb07" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_invitations_token_hash" ON "invitations"  ("token_hash") `);
        await queryRunner.query(`CREATE INDEX "idx_invitations_expires_at" ON "invitations"  ("expires_at") `);
        await queryRunner.query(`CREATE INDEX "idx_invitations_user_id" ON "invitations"  ("user_id") `);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_fecdffec754fa4d5cea98709776" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD CONSTRAINT "FK_504adeb0e31e50792c33aced772" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_504adeb0e31e50792c33aced772"`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_fecdffec754fa4d5cea98709776"`);
        await queryRunner.query(`DROP INDEX "public"."idx_invitations_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_invitations_expires_at"`);
        await queryRunner.query(`DROP INDEX "public"."idx_invitations_token_hash"`);
        await queryRunner.query(`DROP TABLE "invitations"`);
    }

}
