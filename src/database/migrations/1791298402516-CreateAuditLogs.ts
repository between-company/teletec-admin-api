import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuditLogs1791298402516 implements MigrationInterface {
    name = 'CreateAuditLogs1791298402516'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "actor_user_id" uuid, "actor_session_id" uuid, "action" character varying(100) NOT NULL, "entity_type" character varying(100) NOT NULL, "entity_id" uuid, "actor_snapshot" jsonb, "target_snapshot" jsonb, "before_state" jsonb, "after_state" jsonb, "metadata" jsonb, "ip_address" inet, "user_agent" text, "request_id" character varying(100), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2cd10fda8276bb995288acfbfb" ON "audit_logs"  ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_cee5459245f652b75eb2759b4c" ON "audit_logs"  ("action") `);
        await queryRunner.query(`CREATE INDEX "IDX_f160d97a931844109de9d04228" ON "audit_logs"  ("actor_user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7421efc125d95e413657efa3c6" ON "audit_logs"  ("entity_type", "entity_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_7421efc125d95e413657efa3c6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f160d97a931844109de9d04228"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cee5459245f652b75eb2759b4c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2cd10fda8276bb995288acfbfb"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
    }

}
