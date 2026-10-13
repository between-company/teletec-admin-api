import { MigrationInterface, QueryRunner } from "typeorm";

const ROLES = [
    ['admin', 'Admin'],
    ['superadmin', 'Superadmin']
]

const PERMISSIONS = [
    ['users.read', 'Consultar usuarios', 'users'],
    ['users.invite', 'Invitar usuarios', 'users'],
    ['users.update', 'Editar usuarios', 'users'],
    ['users.delete', 'Borrar y restaurar usuarios', 'users'],
    ['users.pause', 'Activar y pausar usuarios', 'users'],
    ['areas.read', 'Consultar áreas', 'areas'],
    ['areas.manage', 'Administrar áreas', 'areas'],
    ['permissions.assign', 'Asignar roles y permisos', 'access']
]

const ADMIN_PERMISSIONS = [
    'users.invite',
    'users.update',
    'users.delete',
    'users.pause',
    'areas.manage',
    'permissions.assign'
]

export class SeedAccessCatalog1791822512387 implements MigrationInterface {
    name = 'SeedAccessCatalog1791822512387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        for (const [key, name] of ROLES) {
            await queryRunner.query(
                `INSERT INTO "roles" ("key", "name") VALUES ($1, $2)`,
                [key, name]
            );
        }

        for (const [key, name, module] of PERMISSIONS) {
            await queryRunner.query(
                `INSERT INTO "permissions" ("key", "name", "module") VALUES ($1, $2, $3)`,
                [key, name, module]
            );
        }

        await queryRunner.query(
            `INSERT INTO "role_permissions" ("role_id", "permission_id")
             SELECT r.id, p.id
             FROM "roles" r
             CROSS JOIN "permissions" p
             WHERE r.key = 'admin' AND p.key = ANY ($1)`,
            [ADMIN_PERMISSIONS]
        );

        await queryRunner.query(
            `INSERT INTO "role_inclusions" ("role_id", "included_role_id")
             SELECT superadmin.id, admin.id
             FROM "roles" superadmin, "roles" admin
             WHERE superadmin.key = 'superadmin' AND admin.key = 'admin'`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM "permissions" WHERE "key" = ANY ($1)`,
            [PERMISSIONS.map(([key]) => key)]
        );
        await queryRunner.query(
            `DELETE FROM "roles" WHERE "key" = ANY ($1)`,
            [ROLES.map(([key]) => key)]
        );
    }

}
