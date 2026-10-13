import dataSource from '../typeorm/data-source.js'
import {
  AREA_CATALOG,
  PERMISSION_CATALOG,
  ROLE_CATALOG,
  assertAccessCatalog,
  effectivePermissions,
} from '../../modules/access/constants/access.catalog.js'

interface KeyRow {
  id: string
  key: string
}

interface AreaRow {
  id: string
  name: string
}

async function seedRolesAndAreas(): Promise<void> {
  assertAccessCatalog()
  await dataSource.initialize()

  try {
    await dataSource.transaction(async (manager) => {
      const stored = await manager.query<KeyRow[]>(
        `SELECT id, key
         FROM permissions
         WHERE key = ANY ($1::text[])`,
        [PERMISSION_CATALOG.map((item) => item.key)],
      )
      const permissionId = new Map(stored.map((row) => [row.key, row.id]))
      const missing = PERMISSION_CATALOG.filter(
        (item) => !permissionId.has(item.key),
      ).map((item) => item.key)

      if (missing.length > 0) {
        throw new Error(
          `Faltan ${missing.length} permisos. Corre pnpm seed:permissions antes. Ejemplo: ${missing.slice(0, 5).join(', ')}`,
        )
      }

      await manager.query(
        `INSERT INTO roles (key, name)
         SELECT item.key, item.name
         FROM UNNEST($1::text[], $2::text[]) AS item(key, name)
         ON CONFLICT (key) DO UPDATE
         SET name = EXCLUDED.name,
             updated_at = now()`,
        [
          ROLE_CATALOG.map((role) => role.key),
          ROLE_CATALOG.map((role) => role.name),
        ],
      )

      const roles = await manager.query<KeyRow[]>(
        `SELECT id, key FROM roles WHERE key = ANY ($1::text[])`,
        [ROLE_CATALOG.map((role) => role.key)],
      )
      const roleId = new Map(roles.map((row) => [row.key, row.id]))
      const inclusionRoles: string[] = []
      const inclusionTargets: string[] = []
      const permissionRoles: string[] = []
      const permissionTargets: string[] = []

      for (const role of ROLE_CATALOG) {
        const id = roleId.get(role.key)

        if (!id) {
          throw new Error(`No se pudo guardar el rol ${role.key}`)
        }

        for (const included of role.includes) {
          const targetId = roleId.get(included)

          if (!targetId) {
            throw new Error(`No se pudo guardar el rol ${included}`)
          }

          inclusionRoles.push(id)
          inclusionTargets.push(targetId)
        }

        for (const key of role.permissions) {
          const targetId = permissionId.get(key)

          if (!targetId) {
            throw new Error(`Permiso ausente: ${key}`)
          }

          permissionRoles.push(id)
          permissionTargets.push(targetId)
        }
      }

      if (inclusionRoles.length > 0) {
        await manager.query(
          `INSERT INTO role_inclusions (role_id, included_role_id)
           SELECT item.role_id, item.included_role_id
           FROM UNNEST($1::uuid[], $2::uuid[])
             AS item(role_id, included_role_id)
           ON CONFLICT ON CONSTRAINT uq_role_inclusions_role_included
           DO NOTHING`,
          [inclusionRoles, inclusionTargets],
        )
      }

      if (permissionRoles.length > 0) {
        await manager.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           SELECT item.role_id, item.permission_id
           FROM UNNEST($1::uuid[], $2::uuid[])
             AS item(role_id, permission_id)
           ON CONFLICT ON CONSTRAINT uq_role_permissions_role_permission
           DO NOTHING`,
          [permissionRoles, permissionTargets],
        )
      }

      await manager.query(
        `INSERT INTO areas (name)
         SELECT item.name
         FROM UNNEST($1::text[]) AS item(name)
         ON CONFLICT (name) DO NOTHING`,
        [AREA_CATALOG.map((area) => area.name)],
      )

      const areas = await manager.query<AreaRow[]>(
        `SELECT id, name FROM areas WHERE name = ANY ($1::text[])`,
        [AREA_CATALOG.map((area) => area.name)],
      )
      const areaId = new Map(areas.map((row) => [row.name, row.id]))
      const areaIds: string[] = []
      const areaPermissionIds: string[] = []

      for (const area of AREA_CATALOG) {
        const id = areaId.get(area.name)

        if (!id) {
          throw new Error(`No se pudo guardar el área ${area.name}`)
        }

        for (const key of effectivePermissions(area.roleKey)) {
          const targetId = permissionId.get(key)

          if (!targetId) {
            throw new Error(`Permiso ausente: ${key}`)
          }

          areaIds.push(id)
          areaPermissionIds.push(targetId)
        }
      }

      await manager.query(
        `INSERT INTO area_permissions (area_id, permission_id)
         SELECT item.area_id, item.permission_id
         FROM UNNEST($1::uuid[], $2::uuid[])
           AS item(area_id, permission_id)
         ON CONFLICT ON CONSTRAINT uq_area_permissions_area_permission
         DO NOTHING`,
        [areaIds, areaPermissionIds],
      )
    })

    console.log(`Roles listos: ${ROLE_CATALOG.length}`)
    console.log(`Áreas listas: ${AREA_CATALOG.length}`)
  } finally {
    await dataSource.destroy()
  }
}

seedRolesAndAreas().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
