import { Injectable } from '@nestjs/common'
import { DataSource, type EntityManager } from 'typeorm'

import { Area } from '../areas/entities/area.entity.js'
import { User } from '../users/entities/user.entity.js'
import { AreaPermission } from './entities/area-permission.entity.js'
import { Permission } from './entities/permission.entity.js'
import { Role } from './entities/role.entity.js'
import { UserPermission } from './entities/user-permission.entity.js'
import { UserRole } from './entities/user-role.entity.js'
import type {
  AssignedRoleRow,
  GrantRow,
  GrantSource
} from './interfaces/grant-row.interface.js'

interface GrantQueryRow {
  key: string
  name: string
  source: GrantSource
  role_key: string | null
  role_name: string | null
  through_role_key: string | null
  through_role_name: string | null
  area_id: string | null
  area_name: string | null
}

const GRANTS_SQL = `
WITH RECURSIVE expanded AS (
  SELECT
    ur.role_id AS role_id,
    ur.role_id AS root_role_id,
    ARRAY[ur.role_id] AS path
  FROM user_roles ur
  WHERE ur.user_id = $1
  UNION
  SELECT
    ri.included_role_id,
    e.root_role_id,
    e.path || ri.included_role_id
  FROM role_inclusions ri
  INNER JOIN expanded e ON e.role_id = ri.role_id
  WHERE NOT ri.included_role_id = ANY (e.path)
)
SELECT
  p.key,
  p.name,
  'role' AS source,
  holder.key AS role_key,
  holder.name AS role_name,
  root.key AS through_role_key,
  root.name AS through_role_name,
  NULL::uuid AS area_id,
  NULL::varchar AS area_name
FROM expanded e
INNER JOIN role_permissions rp ON rp.role_id = e.role_id
INNER JOIN permissions p ON p.id = rp.permission_id
INNER JOIN roles holder ON holder.id = e.role_id
INNER JOIN roles root ON root.id = e.root_role_id
UNION ALL
SELECT
  p.key,
  p.name,
  'area' AS source,
  NULL,
  NULL,
  NULL,
  NULL,
  a.id,
  a.name
FROM user_areas ua
INNER JOIN areas a ON a.id = ua.area_id AND a.is_active = true
INNER JOIN area_permissions ap ON ap.area_id = a.id
INNER JOIN permissions p ON p.id = ap.permission_id
WHERE ua.user_id = $1
UNION ALL
SELECT
  p.key,
  p.name,
  'direct' AS source,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
FROM user_permissions up
INNER JOIN permissions p ON p.id = up.permission_id
WHERE up.user_id = $1
`

@Injectable()
export class AccessRepository {
  constructor(
    private readonly dataSource: DataSource
  ) {}

  listRoles(): Promise<Role[]> {
    return this.dataSource.getRepository(Role).find({
      order: {
        name: 'ASC'
      }
    })
  }

  listPermissions(): Promise<Permission[]> {
    return this.dataSource.getRepository(Permission).find({
      order: {
        module: 'ASC',
        name: 'ASC'
      }
    })
  }

  findRolesByKeys(keys: string[]): Promise<Role[]> {
    if (keys.length === 0) {
      return Promise.resolve([])
    }

    return this.dataSource
      .getRepository(Role)
      .createQueryBuilder('role')
      .where('role.key IN (:...keys)', { keys })
      .getMany()
  }

  findPermissionsByKeys(
    keys: string[]
  ): Promise<Permission[]> {
    if (keys.length === 0) {
      return Promise.resolve([])
    }

    return this.dataSource
      .getRepository(Permission)
      .createQueryBuilder('permission')
      .where('permission.key IN (:...keys)', { keys })
      .getMany()
  }

  findUser(
    userId: string,
    manager?: EntityManager
  ): Promise<User | null> {
    const repository = manager
      ? manager.getRepository(User)
      : this.dataSource.getRepository(User)

    return repository.findOne({
      where: { id: userId }
    })
  }

  findArea(
    areaId: string,
    manager?: EntityManager
  ): Promise<Area | null> {
    const repository = manager
      ? manager.getRepository(Area)
      : this.dataSource.getRepository(Area)

    return repository.findOne({
      where: { id: areaId }
    })
  }

  async findAssignedRoles(
    userId: string
  ): Promise<AssignedRoleRow[]> {
    const rows = await this.dataSource
      .getRepository(Role)
      .createQueryBuilder('role')
      .innerJoin(
        UserRole,
        'userRole',
        'userRole.roleId = role.id AND userRole.userId = :userId',
        { userId }
      )
      .orderBy('role.name', 'ASC')
      .getMany()

    return rows.map((role) => ({
      id: role.id,
      key: role.key,
      name: role.name
    }))
  }

  async findGrants(userId: string): Promise<GrantRow[]> {
    const rows = await this.dataSource.query<GrantQueryRow[]>(
      GRANTS_SQL,
      [userId]
    )

    return rows.map((row) => ({
      key: row.key,
      name: row.name,
      source: row.source,
      roleKey: row.role_key,
      roleName: row.role_name,
      throughRoleKey: row.through_role_key,
      throughRoleName: row.through_role_name,
      areaId: row.area_id,
      areaName: row.area_name
    }))
  }

  findUserRoles(
    userId: string,
    manager: EntityManager
  ): Promise<UserRole[]> {
    return manager.getRepository(UserRole).find({
      where: { userId },
      relations: {
        role: true
      }
    })
  }

  async replaceUserRoles(
    userId: string,
    roles: Role[],
    manager: EntityManager
  ): Promise<{
    removed: UserRole[]
    added: Role[]
  }> {
    const current = await this.findUserRoles(userId, manager)
    const nextIds = new Set(roles.map((role) => role.id))
    const currentIds = new Set(current.map((row) => row.roleId))
    const removed = current.filter(
      (row) => !nextIds.has(row.roleId)
    )
    const added = roles.filter(
      (role) => !currentIds.has(role.id)
    )
    const repository = manager.getRepository(UserRole)

    if (removed.length > 0) {
      await repository.remove(removed)
    }

    if (added.length > 0) {
      await repository.save(
        added.map((role) =>
          repository.create({
            userId,
            roleId: role.id
          })
        )
      )
    }

    return { removed, added }
  }

  findAreaPermissions(
    areaId: string,
    manager?: EntityManager
  ): Promise<AreaPermission[]> {
    const repository = manager
      ? manager.getRepository(AreaPermission)
      : this.dataSource.getRepository(AreaPermission)

    return repository.find({
      where: { areaId },
      relations: {
        permission: true
      }
    })
  }

  async replaceAreaPermissions(
    areaId: string,
    permissions: Permission[],
    manager: EntityManager
  ): Promise<{
    removed: AreaPermission[]
    added: Permission[]
  }> {
    const current = await this.findAreaPermissions(
      areaId,
      manager
    )
    const nextIds = new Set(
      permissions.map((permission) => permission.id)
    )
    const currentIds = new Set(
      current.map((row) => row.permissionId)
    )
    const removed = current.filter(
      (row) => !nextIds.has(row.permissionId)
    )
    const added = permissions.filter(
      (permission) => !currentIds.has(permission.id)
    )
    const repository = manager.getRepository(AreaPermission)

    if (removed.length > 0) {
      await repository.remove(removed)
    }

    if (added.length > 0) {
      await repository.save(
        added.map((permission) =>
          repository.create({
            areaId,
            permissionId: permission.id
          })
        )
      )
    }

    return { removed, added }
  }

  findUserPermissions(
    userId: string,
    manager: EntityManager
  ): Promise<UserPermission[]> {
    return manager.getRepository(UserPermission).find({
      where: { userId },
      relations: {
        permission: true
      }
    })
  }

  async replaceUserPermissions(
    userId: string,
    permissions: Permission[],
    manager: EntityManager
  ): Promise<{
    removed: UserPermission[]
    added: Permission[]
  }> {
    const current = await this.findUserPermissions(
      userId,
      manager
    )
    const nextIds = new Set(
      permissions.map((permission) => permission.id)
    )
    const currentIds = new Set(
      current.map((row) => row.permissionId)
    )
    const removed = current.filter(
      (row) => !nextIds.has(row.permissionId)
    )
    const added = permissions.filter(
      (permission) => !currentIds.has(permission.id)
    )
    const repository = manager.getRepository(UserPermission)

    if (removed.length > 0) {
      await repository.remove(removed)
    }

    if (added.length > 0) {
      await repository.save(
        added.map((permission) =>
          repository.create({
            userId,
            permissionId: permission.id
          })
        )
      )
    }

    return { removed, added }
  }
}
