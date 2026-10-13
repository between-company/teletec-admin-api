import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAccess1791822512386 implements MigrationInterface {
    name = 'CreateAccess1791822512386'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "key" character varying(150) NOT NULL, "name" character varying(150) NOT NULL, "module" character varying(100) NOT NULL, CONSTRAINT "UQ_017943867ed5ceef9c03edd9745" UNIQUE ("key"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8b634526cdd01f2adba6c7ac07" ON "permissions"  ("module") `);
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "key" character varying(100) NOT NULL, "name" character varying(150) NOT NULL, CONSTRAINT "UQ_a87cf0659c3ac379b339acf36a2" UNIQUE ("key"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "area_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "area_id" uuid NOT NULL, "permission_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "uq_area_permissions_area_permission" UNIQUE ("area_id", "permission_id"), CONSTRAINT "PK_51ac5d1d75d3fe2fa9e2b92071a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1e12d6e0e270feac9e1ba7f0aa" ON "area_permissions"  ("area_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c34c4825af0b8d3c99ebe9007f" ON "area_permissions"  ("permission_id") `);
        await queryRunner.query(`CREATE TABLE "role_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role_id" uuid NOT NULL, "permission_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "uq_role_permissions_role_permission" UNIQUE ("role_id", "permission_id"), CONSTRAINT "PK_84059017c90bfcb701b8fa42297" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_178199805b901ccd220ab7740e" ON "role_permissions"  ("role_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_17022daf3f885f7d35423e9971" ON "role_permissions"  ("permission_id") `);
        await queryRunner.query(`CREATE TABLE "user_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "permission_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "uq_user_permissions_user_permission" UNIQUE ("user_id", "permission_id"), CONSTRAINT "PK_01f4295968ba33d73926684264f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3495bd31f1862d02931e8e8d2e" ON "user_permissions"  ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_8145f5fadacd311693c15e41f1" ON "user_permissions"  ("permission_id") `);
        await queryRunner.query(`CREATE TABLE "role_inclusions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role_id" uuid NOT NULL, "included_role_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "uq_role_inclusions_role_included" UNIQUE ("role_id", "included_role_id"), CONSTRAINT "PK_060c4ddce1c274285621e2a0c13" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c2d8575b0737c224a5988fed3d" ON "role_inclusions"  ("role_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_607c4a70ca2af20ec495d280f8" ON "role_inclusions"  ("included_role_id") `);
        await queryRunner.query(`CREATE TABLE "user_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "role_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "uq_user_roles_user_role" UNIQUE ("user_id", "role_id"), CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_87b8888186ca9769c960e92687" ON "user_roles"  ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b23c65e50a758245a33ee35fda" ON "user_roles"  ("role_id") `);
        await queryRunner.query(`ALTER TABLE "area_permissions" ADD CONSTRAINT "FK_1e12d6e0e270feac9e1ba7f0aa2" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "area_permissions" ADD CONSTRAINT "FK_c34c4825af0b8d3c99ebe9007f4" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_permissions" ADD CONSTRAINT "FK_3495bd31f1862d02931e8e8d2e8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_permissions" ADD CONSTRAINT "FK_8145f5fadacd311693c15e41f10" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_inclusions" ADD CONSTRAINT "FK_c2d8575b0737c224a5988fed3d5" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_inclusions" ADD CONSTRAINT "FK_607c4a70ca2af20ec495d280f89" FOREIGN KEY ("included_role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"`);
        await queryRunner.query(`ALTER TABLE "role_inclusions" DROP CONSTRAINT "FK_607c4a70ca2af20ec495d280f89"`);
        await queryRunner.query(`ALTER TABLE "role_inclusions" DROP CONSTRAINT "FK_c2d8575b0737c224a5988fed3d5"`);
        await queryRunner.query(`ALTER TABLE "user_permissions" DROP CONSTRAINT "FK_8145f5fadacd311693c15e41f10"`);
        await queryRunner.query(`ALTER TABLE "user_permissions" DROP CONSTRAINT "FK_3495bd31f1862d02931e8e8d2e8"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_178199805b901ccd220ab7740ec"`);
        await queryRunner.query(`ALTER TABLE "area_permissions" DROP CONSTRAINT "FK_c34c4825af0b8d3c99ebe9007f4"`);
        await queryRunner.query(`ALTER TABLE "area_permissions" DROP CONSTRAINT "FK_1e12d6e0e270feac9e1ba7f0aa2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b23c65e50a758245a33ee35fda"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_87b8888186ca9769c960e92687"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_607c4a70ca2af20ec495d280f8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c2d8575b0737c224a5988fed3d"`);
        await queryRunner.query(`DROP TABLE "role_inclusions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8145f5fadacd311693c15e41f1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3495bd31f1862d02931e8e8d2e"`);
        await queryRunner.query(`DROP TABLE "user_permissions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_17022daf3f885f7d35423e9971"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_178199805b901ccd220ab7740e"`);
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c34c4825af0b8d3c99ebe9007f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1e12d6e0e270feac9e1ba7f0aa"`);
        await queryRunner.query(`DROP TABLE "area_permissions"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8b634526cdd01f2adba6c7ac07"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
    }

}
