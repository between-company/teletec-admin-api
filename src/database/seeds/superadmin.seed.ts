import dataSource from '../typeorm/data-source.js'

const email = (
  process.env.SEED_ADMIN_EMAIL ?? 'admin@teletec.local'
)
  .trim()
  .toLowerCase()

const SUPERADMIN_ROLE_KEY = 'superadmin'
const REQUIRED_TABLES = [
  'roles',
  'permissions',
  'user_roles',
  'user_permissions'
]

interface IdRow {
  id: string
}

interface TableRow {
  table_name: string
}

interface CountRow {
  count: string
}

async function seedSuperadmin(): Promise<void> {
  await dataSource.initialize()

  try {
    const tables = await dataSource.query<TableRow[]>(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = current_schema()
         AND table_name = ANY ($1::text[])`,
      [REQUIRED_TABLES]
    )
    const present = new Set(tables.map((row) => row.table_name))
    const missing = REQUIRED_TABLES.filter((name) => !present.has(name))

    if (missing.length > 0) {
      throw new Error(
        `Faltan tablas de acceso: ${missing.join(', ')}. Corre las migraciones de access y pnpm seed:permissions / seed:roles-areas antes.`
      )
    }

    const [user] = await dataSource.query<IdRow[]>(
      `SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    )

    if (!user) {
      throw new Error(
        `No existe el usuario ${email}. Corre pnpm seed:admin antes.`
      )
    }

    const [role] = await dataSource.query<IdRow[]>(
      `SELECT id FROM roles WHERE key = $1`,
      [SUPERADMIN_ROLE_KEY]
    )

    if (!role) {
      throw new Error(
        `No existe el rol ${SUPERADMIN_ROLE_KEY}. Corre pnpm seed:roles-areas antes.`
      )
    }

    await dataSource.transaction(async (manager) => {
      await manager.query(
        `INSERT INTO user_roles (user_id, role_id)
         VALUES ($1, $2)
         ON CONFLICT ON CONSTRAINT uq_user_roles_user_role DO NOTHING`,
        [user.id, role.id]
      )

      await manager.query(
        `INSERT INTO user_permissions (user_id, permission_id)
         SELECT $1::uuid, p.id
         FROM permissions p
         ON CONFLICT ON CONSTRAINT uq_user_permissions_user_permission
         DO NOTHING`,
        [user.id]
      )

      await manager.query(
        `UPDATE users
         SET is_active = true,
             activated_at = COALESCE(activated_at, now()),
             updated_at = now()
         WHERE id = $1`,
        [user.id]
      )
    })

    const [{ count }] = await dataSource.query<CountRow[]>(
      `SELECT count(*)::text AS count
       FROM user_permissions
       WHERE user_id = $1`,
      [user.id]
    )

    console.log(`Superadmin listo: ${email}`)
    console.log(`Rol asignado: ${SUPERADMIN_ROLE_KEY}`)
    console.log(`Permisos directos: ${count}`)
  } finally {
    await dataSource.destroy()
  }
}

seedSuperadmin().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
