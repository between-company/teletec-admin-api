import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddContactPhoneCountryCodes1791936000002 implements MigrationInterface {
  name = 'AddContactPhoneCountryCodes1791936000002'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contacts" ADD "phone_country_code" character varying(8)`)
    await queryRunner.query(`ALTER TABLE "contacts" ADD "office_phone_country_code" character varying(8)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN "office_phone_country_code"`)
    await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN "phone_country_code"`)
  }
}
