import * as argon2 from 'argon2'

import dataSource from '../typeorm/data-source.js'
import { User } from '../../modules/users/entities/user.entity.js'
import { ROLE_KEYS } from '../../modules/access/constants/access.constants.js'
import {
  PERMISSION_CATALOG,
  ROLE_CATALOG,
  assertAccessCatalog,
} from '../../modules/access/constants/access.catalog.js'

const email = (
  process.env.SEED_ADMIN_EMAIL ?? 'admin@teletec.local'
)
  .trim()
  .toLowerCase()

const password = process.env.SEED_ADMIN_PASSWORD

interface KeyRow {
  key: string
}

async function seedAdmin(): Promise<void> {
  if (!password) {
    throw new Error('SEED_ADMIN_PASSWORD is required')
  }

  assertAccessCatalog()
  await dataSource.initialize()

  try {
    await dataSource.transaction(async (manager) => {
      const storedPermissions = await manager.query<KeyRow[]>(
        `SELECT key FROM permissions WHERE key = ANY ($1::text[])`,
        [PERMISSION_CATALOG.map((item) => item.key)],
      )
      const permissionKeys = new Set(storedPermissions.map((row) => row.key))
      const missingPermissions = PERMISSION_CATALOG.filter(
        (item) => !permissionKeys.has(item.key),
      ).map((item) => item.key)

      if (missingPermissions.length > 0) {
        throw new Error(
          `Faltan ${missingPermissions.length} permisos. Corre pnpm seed:permissions antes`,
        )
      }

      const storedRoles = await manager.query<KeyRow[]>(
        `SELECT key FROM roles WHERE key = ANY ($1::text[])`,
        [ROLE_CATALOG.map((role) => role.key)],
      )
      const roleKeys = new Set(storedRoles.map((row) => row.key))
      const missingRoles = ROLE_CATALOG.filter(
        (role) => !roleKeys.has(role.key),
      ).map((role) => role.key)

      if (missingRoles.length > 0) {
        throw new Error(
          `Faltan los roles ${missingRoles.join(', ')}. Corre pnpm seed:roles-areas antes`,
        )
      }

      const users = manager.getRepository(User)
      let user = await users.findOne({
        where: { email },
        withDeleted: true,
      })

      if (user) {
        console.log(`El usuario ya existe: ${email}`)

        if (
          user.deletedAt ||
          !user.isActive ||
          !user.activatedAt ||
          !user.passwordHash
        ) {
          user.deletedAt = null
          user.deletedById = null
          user.isActive = true
          user.activatedAt = user.activatedAt ?? new Date()
          user.passwordHash =
            user.passwordHash ??
            (await argon2.hash(password, { type: argon2.argon2id }))
          user = await users.save(user)

          console.log(`Usuario reactivado: ${email}`)
        }
      } else {
        const passwordHash = await argon2.hash(password, {
          type: argon2.argon2id,
        })

        user = await users.save(
          users.create({
            email,
            passwordHash,
            firstName: 'Administrador',
            lastName: 'TELETEC',
            phoneCountryCode: null,
            phone: null,
            isActive: true,
            activatedAt: new Date(),
          }),
        )

        console.log(`Usuario creado: ${user.email}`)
      }

      await manager.query(
        `INSERT INTO user_roles (user_id, role_id)
         SELECT $1, r.id FROM roles r WHERE r.key = $2
         ON CONFLICT ON CONSTRAINT uq_user_roles_user_role DO NOTHING`,
        [user.id, ROLE_KEYS.SUPERADMIN],
      )

      await manager.query(
        `INSERT INTO role_permissions (role_id, permission_id)
         SELECT r.id, p.id
         FROM roles r
         CROSS JOIN permissions p
         WHERE r.key = $1
         ON CONFLICT ON CONSTRAINT uq_role_permissions_role_permission
         DO NOTHING`,
        [ROLE_KEYS.SUPERADMIN],
      )

      const [granted] = await manager.query<{ count: string }[]>(
        `SELECT count(*) FROM role_permissions rp
         INNER JOIN roles r ON r.id = rp.role_id
         WHERE r.key = $1`,
        [ROLE_KEYS.SUPERADMIN],
      )

      console.log(
        `Rol ${ROLE_KEYS.SUPERADMIN} asignado a ${user.email} con ${granted.count} permisos`,
      )
    })
  } finally {
    await dataSource.destroy()
  }
}

seedAdmin().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
