export const ROLE_KEYS = {
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin'
} as const

export const PERMISSIONS = {
  USERS_READ: 'users.read',
  USERS_INVITE: 'users.invite',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_PAUSE: 'users.pause',
  AREAS_READ: 'areas.read',
  AREAS_MANAGE: 'areas.manage',
  PERMISSIONS_ASSIGN: 'permissions.assign'
} as const

export const REQUIRE_PERMISSIONS = 'require_permissions'

const RESOURCES_WHOSE_WRITES_GRANT_READ = new Set([
  'users'
])

export function expandImpliedKeys(
  keys: Iterable<string>
): string[] {
  const expanded = new Set(keys)

  for (const key of keys) {
    const dot = key.lastIndexOf('.')

    if (dot <= 0) {
      continue
    }

    const resource = key.slice(0, dot)
    const action = key.slice(dot + 1)

    if (action === 'read') {
      continue
    }

    if (
      action === 'manage' ||
      RESOURCES_WHOSE_WRITES_GRANT_READ.has(resource)
    ) {
      expanded.add(`${resource}.read`)
    }
  }

  return [...expanded].sort()
}
