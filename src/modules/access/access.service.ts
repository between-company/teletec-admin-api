import { HttpStatus, Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'

import { ERROR_CODES } from '../../common/http/constants/error-codes.js'
import { ApiException } from '../../common/http/exceptions/api.exception.js'
import { errorMessage } from '../../common/http/messages/error-message.catalog.js'
import { AuditService } from '../audit/audit.service.js'
import { AuditAction } from '../audit/enums/audit-action.enum.js'
import { AuditEntityType } from '../audit/enums/audit-entity-type.enum.js'
import { AccessRepository } from './access.repository.js'
import { expandImpliedKeys } from './constants/access.constants.js'
import type { Area } from '../areas/entities/area.entity.js'
import type { Permission } from './entities/permission.entity.js'
import type { Role } from './entities/role.entity.js'
import type { GrantRow } from './interfaces/grant-row.interface.js'

export interface AccessOrigin {
  type: 'role' | 'area' | 'direct'
  roleKey?: string
  roleName?: string
  throughRoleKey?: string
  throughRoleName?: string
  areaId?: string
  areaName?: string
}

export interface AccessGrant {
  key: string
  name: string
  origins: AccessOrigin[]
}

export interface UserAccess {
  userId: string
  roles: {
    id: string
    key: string
    name: string
  }[]
  grants: AccessGrant[]
  permissions: string[]
}

export interface SessionAccess {
  roleKeys: string[]
  permissions: string[]
}

export interface AreaAccess {
  areaId: string
  grants: AccessGrant[]
}

@Injectable()
export class AccessService {
  constructor(
    private readonly accessRepository: AccessRepository,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource
  ) {}

  async listRoles(): Promise<Role[]> {
    return this.accessRepository.listRoles()
  }

  async listPermissions(): Promise<Permission[]> {
    return this.accessRepository.listPermissions()
  }

  async getSessionAccess(
    userId: string
  ): Promise<SessionAccess> {
    await this.assertActiveUser(userId)
    const access = await this.loadAccess(userId)

    return {
      roleKeys: access.roles.map((role) => role.key),
      permissions: access.permissions
    }
  }

  async getUserAccess(userId: string): Promise<UserAccess> {
    const user = await this.accessRepository.findUser(userId)

    if (!user) {
      throw this.userNotFound()
    }

    return this.loadAccess(userId)
  }

  async assertGranted(
    userId: string,
    keys: string[]
  ): Promise<void> {
    const access = await this.getSessionAccess(userId)
    const missing = keys.filter(
      (key) => !access.permissions.includes(key)
    )

    if (missing.length > 0) {
      throw new ApiException({
        statusCode: HttpStatus.FORBIDDEN,
        code: ERROR_CODES.ACCESS_FORBIDDEN,
        message: errorMessage(ERROR_CODES.ACCESS_FORBIDDEN)
      })
    }
  }

  async replaceUserRoles(
    userId: string,
    roleKeys: string[]
  ): Promise<UserAccess> {
    const roles = await this.requireRoles(roleKeys)
    const user = await this.accessRepository.findUser(userId)

    if (!user) {
      throw this.userNotFound()
    }

    await this.dataSource.transaction(async (manager) => {
      const { removed, added } =
        await this.accessRepository.replaceUserRoles(
          userId,
          roles,
          manager
        )

      for (const row of removed) {
        await this.auditService.create(
          {
            action: AuditAction.ROLE_REMOVED,
            entityType: AuditEntityType.USER,
            entityId: userId,
            targetSnapshot: {
              email: user.email
            },
            before: {
              roleKey: row.role.key,
              roleName: row.role.name
            }
          },
          manager
        )
      }

      for (const role of added) {
        await this.auditService.create(
          {
            action: AuditAction.ROLE_ASSIGNED,
            entityType: AuditEntityType.USER,
            entityId: userId,
            targetSnapshot: {
              email: user.email
            },
            after: {
              roleKey: role.key,
              roleName: role.name
            }
          },
          manager
        )
      }
    })

    return this.loadAccess(userId)
  }

  async getAreaAccess(areaId: string): Promise<AreaAccess> {
    const area = await this.requireArea(areaId)

    return this.loadAreaAccess(area)
  }

  async replaceAreaPermissions(
    areaId: string,
    permissionKeys: string[]
  ): Promise<AreaAccess> {
    const permissions =
      await this.requirePermissions(permissionKeys)
    const area = await this.requireArea(areaId)

    await this.dataSource.transaction(async (manager) => {
      const { removed, added } =
        await this.accessRepository.replaceAreaPermissions(
          areaId,
          permissions,
          manager
        )

      for (const row of removed) {
        await this.auditService.create(
          {
            action: AuditAction.PERMISSION_REMOVED,
            entityType: AuditEntityType.AREA,
            entityId: areaId,
            targetSnapshot: {
              name: area.name
            },
            before: {
              permissionKey: row.permission.key
            }
          },
          manager
        )
      }

      for (const permission of added) {
        await this.auditService.create(
          {
            action: AuditAction.PERMISSION_ASSIGNED,
            entityType: AuditEntityType.AREA,
            entityId: areaId,
            targetSnapshot: {
              name: area.name
            },
            after: {
              permissionKey: permission.key
            }
          },
          manager
        )
      }
    })

    return this.loadAreaAccess(area)
  }

  private async loadAreaAccess(area: Area): Promise<AreaAccess> {
    const rows =
      await this.accessRepository.findAreaPermissions(area.id)

    return {
      areaId: area.id,
      grants: rows
        .map((row) => ({
          key: row.permission.key,
          name: row.permission.name,
          origins: [
            {
              type: 'area' as const,
              areaId: area.id,
              areaName: area.name
            }
          ]
        }))
        .sort((left, right) =>
          left.key.localeCompare(right.key)
        )
    }
  }

  async replaceUserPermissions(
    userId: string,
    permissionKeys: string[]
  ): Promise<UserAccess> {
    const permissions =
      await this.requirePermissions(permissionKeys)
    const user = await this.accessRepository.findUser(userId)

    if (!user) {
      throw this.userNotFound()
    }

    await this.dataSource.transaction(async (manager) => {
      const { removed, added } =
        await this.accessRepository.replaceUserPermissions(
          userId,
          permissions,
          manager
        )

      for (const row of removed) {
        await this.auditService.create(
          {
            action: AuditAction.PERMISSION_REMOVED,
            entityType: AuditEntityType.USER,
            entityId: userId,
            targetSnapshot: {
              email: user.email
            },
            before: {
              permissionKey: row.permission.key
            }
          },
          manager
        )
      }

      for (const permission of added) {
        await this.auditService.create(
          {
            action: AuditAction.PERMISSION_ASSIGNED,
            entityType: AuditEntityType.USER,
            entityId: userId,
            targetSnapshot: {
              email: user.email
            },
            after: {
              permissionKey: permission.key
            }
          },
          manager
        )
      }
    })

    return this.loadAccess(userId)
  }

  private async loadAccess(
    userId: string
  ): Promise<UserAccess> {
    const [roles, grants] = await Promise.all([
      this.accessRepository.findAssignedRoles(userId),
      this.accessRepository.findGrants(userId)
    ])
    const grouped = this.groupGrants(grants)

    return {
      userId,
      roles,
      grants: grouped,
      permissions: expandImpliedKeys(
        grouped.map((grant) => grant.key)
      )
    }
  }

  private groupGrants(rows: GrantRow[]): AccessGrant[] {
    const grouped = new Map<string, AccessGrant>()

    for (const row of rows) {
      const current = grouped.get(row.key) ?? {
        key: row.key,
        name: row.name,
        origins: []
      }
      current.origins.push(this.toOrigin(row))
      grouped.set(row.key, current)
    }

    return [...grouped.values()].sort((left, right) =>
      left.key.localeCompare(right.key)
    )
  }

  private toOrigin(row: GrantRow): AccessOrigin {
    if (row.source === 'area') {
      return {
        type: 'area',
        areaId: row.areaId ?? undefined,
        areaName: row.areaName ?? undefined
      }
    }

    if (row.source === 'direct') {
      return { type: 'direct' }
    }

    const through =
      row.throughRoleKey &&
      row.throughRoleKey !== row.roleKey
        ? {
            throughRoleKey: row.throughRoleKey,
            throughRoleName: row.throughRoleName ?? undefined
          }
        : {}

    return {
      type: 'role',
      roleKey: row.roleKey ?? undefined,
      roleName: row.roleName ?? undefined,
      ...through
    }
  }

  private async assertActiveUser(
    userId: string
  ): Promise<void> {
    const user = await this.accessRepository.findUser(userId)

    if (!user) {
      throw new ApiException({
        statusCode: HttpStatus.UNAUTHORIZED,
        code: ERROR_CODES.AUTH_INVALID_SESSION,
        message: errorMessage(ERROR_CODES.AUTH_INVALID_SESSION)
      })
    }

    if (!user.isActive) {
      throw new ApiException({
        statusCode: HttpStatus.UNAUTHORIZED,
        code: ERROR_CODES.USER_INACTIVE,
        message: errorMessage(ERROR_CODES.USER_INACTIVE)
      })
    }
  }

  private async requireRoles(
    keys: string[]
  ): Promise<Role[]> {
    const uniqueKeys = [...new Set(keys)]
    const roles =
      await this.accessRepository.findRolesByKeys(uniqueKeys)

    if (roles.length !== uniqueKeys.length) {
      throw new ApiException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.ROLE_NOT_FOUND,
        message: errorMessage(ERROR_CODES.ROLE_NOT_FOUND)
      })
    }

    return roles
  }

  private async requirePermissions(
    keys: string[]
  ): Promise<Permission[]> {
    const uniqueKeys = [...new Set(keys)]
    const permissions =
      await this.accessRepository.findPermissionsByKeys(
        uniqueKeys
      )

    if (permissions.length !== uniqueKeys.length) {
      throw new ApiException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.PERMISSION_NOT_FOUND,
        message: errorMessage(ERROR_CODES.PERMISSION_NOT_FOUND)
      })
    }

    return permissions
  }

  private async requireArea(areaId: string): Promise<Area> {
    const area = await this.accessRepository.findArea(areaId)

    if (!area) {
      throw new ApiException({
        statusCode: HttpStatus.NOT_FOUND,
        code: ERROR_CODES.AREA_NOT_FOUND,
        message: errorMessage(ERROR_CODES.AREA_NOT_FOUND)
      })
    }

    return area
  }

  private userNotFound(): ApiException {
    return new ApiException({
      statusCode: HttpStatus.NOT_FOUND,
      code: ERROR_CODES.USER_NOT_FOUND,
      message: errorMessage(ERROR_CODES.USER_NOT_FOUND)
    })
  }
}
