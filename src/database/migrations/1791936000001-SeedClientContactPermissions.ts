import type { MigrationInterface, QueryRunner } from 'typeorm'

const PERMISSIONS = [
  ['clients.create', 'Crear clientes', 'clients'],
  ['clients.read', 'Consultar clientes', 'clients'],
  ['clients.update', 'Editar clientes', 'clients'],
  ['clients.delete', 'Borrar clientes', 'clients'],
  ['client-contacts.create', 'Crear contactos de clientes', 'client-contacts'],
  [
    'client-contacts.read',
    'Consultar contactos de clientes',
    'client-contacts'
  ],
  ['client-contacts.update', 'Editar contactos de clientes', 'client-contacts'],
  ['client-contacts.delete', 'Borrar contactos de clientes', 'client-contacts']
]

export class SeedClientContactPermissions1791936000001 implements MigrationInterface {
  name = 'SeedClientContactPermissions1791936000001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [key, name, module] of PERMISSIONS) {
      await queryRunner.query(
        `INSERT INTO "permissions" ("key", "name", "module") VALUES ($1, $2, $3) ON CONFLICT ("key") DO NOTHING`,
        [key, name, module]
      )
    }
    await queryRunner.query(
      `INSERT INTO "role_permissions" ("role_id", "permission_id")
       SELECT r.id, p.id FROM "roles" r CROSS JOIN "permissions" p
       WHERE p.key = ANY ($1)
       AND (r.key = 'admin'
         OR (r.key = 'administrador' AND p.key = ANY ($2))
         OR (r.key = 'vendedor' AND p.key = ANY ($3)))
       ON CONFLICT ("role_id", "permission_id") DO NOTHING`,
      [
        PERMISSIONS.map(([key]) => key),
        [
          'clients.update',
          'clients.delete',
          'client-contacts.update',
          'client-contacts.delete'
        ],
        [
          'clients.create',
          'clients.read',
          'client-contacts.create',
          'client-contacts.read'
        ]
      ]
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Creation/read keys belong to the existing access catalog; preserve them.
    await queryRunner.query(
      `DELETE FROM "permissions" WHERE "key" = ANY ($1)`,
      [
        [
          'clients.update',
          'clients.delete',
          'client-contacts.update',
          'client-contacts.delete'
        ]
      ]
    )
  }
}
