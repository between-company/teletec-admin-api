import type { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateClientsAndContacts1791936000000 implements MigrationInterface {
  name = 'CreateClientsAndContacts1791936000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."contact_type_enum" AS ENUM ('compras', 'operaciones')`
    )
    await queryRunner.query(`CREATE TABLE "clients" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "name" character varying(150) NOT NULL,
      "rfc" character varying(13),
      "sap_number" character varying(50),
      "registered_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "is_active" boolean NOT NULL DEFAULT true,
      "deleted_at" TIMESTAMP WITH TIME ZONE,
      CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id")
    )`)
    await queryRunner.query(`CREATE TABLE "contacts" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      "client_id" uuid NOT NULL,
      "name" character varying(150) NOT NULL,
      "email" character varying(320),
      "phone" character varying(30),
      "office_phone" character varying(30),
      "type" "public"."contact_type_enum" NOT NULL,
      "is_active" boolean NOT NULL DEFAULT true,
      "deleted_at" TIMESTAMP WITH TIME ZONE,
      CONSTRAINT "PK_b99cd40cfd66a99f1571f4f72e6" PRIMARY KEY ("id"),
      CONSTRAINT "fk_contacts_client_id" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE
    )`)
    await queryRunner.query(
      `CREATE INDEX "idx_clients_is_active" ON "clients" ("is_active")`
    )
    await queryRunner.query(
      `CREATE INDEX "idx_clients_deleted_at" ON "clients" ("deleted_at")`
    )
    await queryRunner.query(
      `CREATE INDEX "idx_contacts_client_id" ON "contacts" ("client_id")`
    )
    await queryRunner.query(
      `CREATE INDEX "idx_contacts_type" ON "contacts" ("type")`
    )
    await queryRunner.query(
      `CREATE INDEX "idx_contacts_is_active" ON "contacts" ("is_active")`
    )
    await queryRunner.query(
      `CREATE INDEX "idx_contacts_deleted_at" ON "contacts" ("deleted_at")`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "contacts"`)
    await queryRunner.query(`DROP TABLE "clients"`)
    await queryRunner.query(`DROP TYPE "public"."contact_type_enum"`)
  }
}
