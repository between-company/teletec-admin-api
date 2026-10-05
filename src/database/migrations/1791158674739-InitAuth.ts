import { MigrationInterface, QueryRunner } from "typeorm";

export class InitAuth1791158674739 implements MigrationInterface {
    name = 'InitAuth1791158674739'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "email" character varying(320) NOT NULL, "password_hash" character varying(255) NOT NULL, "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "deleted_at" TIMESTAMP WITH TIME ZONE, "deleted_by_id" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_users_is_active" ON "users"  ("is_active") `);
        await queryRunner.query(`CREATE INDEX "idx_users_deleted_at" ON "users"  ("deleted_at") `);
        await queryRunner.query(`CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "refresh_token_hash" character varying(128) NOT NULL, "device_name" character varying(255), "user_agent" text, "ip_address" inet, "last_seen_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE, "revoked_reason" character varying(255), "revoked_by_id" uuid, CONSTRAINT "UQ_d6185b2849a1e4d0c067a57ca89" UNIQUE ("refresh_token_hash"), CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_sessions_expires_at" ON "sessions"  ("expires_at") `);
        await queryRunner.query(`CREATE INDEX "idx_sessions_user_revoked" ON "sessions"  ("user_id", "revoked_at") `);
        await queryRunner.query(`CREATE INDEX "idx_sessions_user_id" ON "sessions"  ("user_id") `);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_4241f21b9bb35e82a6217af1aad" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_cd78d6f926c0a545e674eacb286" FOREIGN KEY ("revoked_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_cd78d6f926c0a545e674eacb286"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_4241f21b9bb35e82a6217af1aad"`);
        await queryRunner.query(`DROP INDEX "public"."idx_sessions_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_sessions_user_revoked"`);
        await queryRunner.query(`DROP INDEX "public"."idx_sessions_expires_at"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
        await queryRunner.query(`DROP INDEX "public"."idx_users_deleted_at"`);
        await queryRunner.query(`DROP INDEX "public"."idx_users_is_active"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
