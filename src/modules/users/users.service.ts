import {
  HttpStatus,
  Injectable
} from '@nestjs/common'

import {
  DataSource,
  type EntityManager
} from 'typeorm'

import {
  ERROR_CODES
} from '../../common/http/constants/error-codes.js'

import {
  errorMessage
} from '../../common/http/messages/error-message.catalog.js'

import {
  ApiException
} from '../../common/http/exceptions/api.exception.js'

import {
  AreasService
} from '../areas/areas.service.js'

import {
  AuditService
} from '../audit/audit.service.js'

import {
  AuditAction
} from '../audit/enums/audit-action.enum.js'

import {
  AuditEntityType
} from '../audit/enums/audit-entity-type.enum.js'

import {
  createPaginationMeta,
  paginated
} from '../../common/http/helpers/api-response.helper.js'

import {
  CreateUserDto
} from './dto/create-user.dto.js'

import {
  DeleteUserResponseDto
} from './dto/delete-user-response.dto.js'

import {
  UpdateUserDto
} from './dto/update-user.dto.js'

import {
  ListUsersQueryDto
} from './dto/list-users-query.dto.js'

import {
  UserAreaResponseDto,
  UserResponseDto
} from './dto/user-response.dto.js'

import {
  Area
} from '../areas/entities/area.entity.js'

import {
  User
} from './entities/user.entity.js'

import {
  UserAreasRepository
} from './repositories/user-areas.repository.js'

import {
  UsersRepository
} from './repositories/users.repository.js'
import { UserForAuthentication } from './interfaces/user-for-authentication.interface.js'

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository:
      UsersRepository,
    private readonly userAreasRepository:
      UserAreasRepository,
    private readonly areasService:
      AreasService,
    private readonly auditService:
      AuditService,
    private readonly dataSource:
      DataSource
  ) {}

  async findAll(
    filters: ListUsersQueryDto
  ) {
    const {
      items,
      totalItems
    } = await this.usersRepository.findAll({
      isActive: filters.isActive,
      search: filters.search,
      areaId: filters.areaId,
      page: filters.page,
      limit: filters.limit
    })

    const data = items.map((user) =>
      this.toResponse(user)
    )

    return paginated(
      data,
      createPaginationMeta({
        page: filters.page,
        limit: filters.limit,
        totalItems
      })
    )
  }

  async findById(
    id: string
  ): Promise<UserResponseDto> {
    const user = await this.usersRepository.findByIdWithAreas(id)

    if (!user) {
      throw this.userNotFoundException()
    }

    return this.toResponse(user)
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    actorUserId: string | null = null
  ): Promise<UserResponseDto> {
    const current = await this.usersRepository.findByIdWithAreas(id)

    if (!current) {
      throw this.userNotFoundException()
    }

    const currentAreas = this.mapAreas(current)
    const preview = this.applyUserChanges(
      current,
      currentAreas.map((area) => area.id),
      dto
    )

    this.assertPhonePair(
      preview.phoneCountryCode,
      preview.phone
    )

    if (!preview.hasChanges) {
      return this.toResponse(current)
    }

    if (preview.areaIds) {
      await this.assertActiveAreas(preview.areaIds)
    }

    return this.dataSource.transaction(
      async (manager) => {
        const user = await this.usersRepository.findByIdForUpdate(
          id,
          manager
        )

        if (!user) {
          throw this.userNotFoundException()
        }

        const memberships = await this.userAreasRepository.findByUserId(
          id,
          manager
        )
        const currentAreaIds = memberships.map(
          (membership) => membership.areaId
        )
        const before = {
          firstName: user.firstName,
          lastName: user.lastName,
          phoneCountryCode: user.phoneCountryCode,
          phone: user.phone,
          isActive: user.isActive,
          areaIds: currentAreaIds
        }
        const next = this.applyUserChanges(
          user,
          currentAreaIds,
          dto
        )

        this.assertPhonePair(
          next.phoneCountryCode,
          next.phone
        )

        if (!next.hasChanges) {
          user.userAreas = memberships

          return this.toResponse(user)
        }

        let areas = memberships
          .filter((membership) => membership.area)
          .map((membership) => membership.area)

        if (next.areaIds) {
          areas = await this.assertActiveAreas(
            next.areaIds,
            manager
          )

          await this.userAreasRepository.deleteByUserId(
            user.id,
            manager
          )

          const userAreas = this.userAreasRepository.createMany(
            user.id,
            next.areaIds,
            manager
          )

          await this.userAreasRepository.saveMany(
            userAreas,
            manager
          )
        }

        user.firstName = next.firstName
        user.lastName = next.lastName
        user.phoneCountryCode = next.phoneCountryCode
        user.phone = next.phone
        user.isActive = next.isActive

        const savedUser = await this.usersRepository.save(
          user,
          manager
        )

        const after = {
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          phoneCountryCode: savedUser.phoneCountryCode,
          phone: savedUser.phone,
          isActive: savedUser.isActive,
          areaIds: areas.map((area) => area.id)
        }
        const onlyStatusChanged =
          before.firstName === after.firstName &&
          before.lastName === after.lastName &&
          before.phoneCountryCode === after.phoneCountryCode &&
          before.phone === after.phone &&
          this.sameIds(before.areaIds, after.areaIds) &&
          before.isActive !== after.isActive

        await this.auditService.create(
          {
            action: onlyStatusChanged
              ? after.isActive
                ? AuditAction.USER_ACTIVATED
                : AuditAction.USER_DEACTIVATED
              : AuditAction.USER_UPDATED,
            entityType: AuditEntityType.USER,
            entityId: savedUser.id,
            ...(actorUserId ? { actorUserId } : {}),
            targetSnapshot: {
              name: `${savedUser.firstName} ${savedUser.lastName}`,
              email: savedUser.email
            },
            before,
            after
          },
          manager
        )

        return this.toResponseDto(
          savedUser,
          areas
            .map((area) => ({
              id: area.id,
              name: area.name
            }))
            .sort((left, right) =>
              left.name.localeCompare(right.name)
            )
        )
      }
    )
  }

  async remove(
    id: string,
    actorUserId: string | null = null
  ): Promise<DeleteUserResponseDto> {
    return this.dataSource.transaction(
      async (manager) => {
        const user = await this.usersRepository.findByIdForUpdate(
          id,
          manager
        )

        if (!user) {
          throw this.userNotFoundException()
        }

        const removed = await this.usersRepository.softRemove(
          user,
          manager
        )

        await this.auditService.create(
          {
            action: AuditAction.USER_DELETED,
            entityType: AuditEntityType.USER,
            entityId: removed.id,
            ...(actorUserId ? { actorUserId } : {}),
            targetSnapshot: {
              name: `${removed.firstName} ${removed.lastName}`,
              email: removed.email
            },
            before: {
              deletedAt: null
            },
            after: {
              deletedAt: removed.deletedAt
            }
          },
          manager
        )

        return {
          id: removed.id,
          deletedAt: removed.deletedAt!
        }
      }
    )
  }

  async restore(
    id: string,
    actorUserId: string | null = null
  ): Promise<UserResponseDto> {
    return this.dataSource.transaction(
      async (manager) => {
        const user = await this.usersRepository.findByIdForUpdate(
          id,
          manager,
          true
        )

        if (!user) {
          throw this.userNotFoundException()
        }

        if (!user.deletedAt) {
          throw new ApiException({
            statusCode: HttpStatus.CONFLICT,
            code: ERROR_CODES.USER_NOT_DELETED,
            message: errorMessage(ERROR_CODES.USER_NOT_DELETED)
          })
        }

        const deletedAt = user.deletedAt

        user.deletedById = null

        const recovered = await this.usersRepository.recover(
          user,
          manager
        )

        recovered.deletedById = null
        recovered.deletedAt = null

        await this.usersRepository.save(
          recovered,
          manager
        )

        await this.auditService.create(
          {
            action: AuditAction.USER_RESTORED,
            entityType: AuditEntityType.USER,
            entityId: recovered.id,
            ...(actorUserId ? { actorUserId } : {}),
            targetSnapshot: {
              name: `${recovered.firstName} ${recovered.lastName}`,
              email: recovered.email
            },
            before: {
              deletedAt
            },
            after: {
              deletedAt: null
            }
          },
          manager
        )

        const memberships = await this.userAreasRepository.findByUserId(
          recovered.id,
          manager
        )

        recovered.userAreas = memberships

        return this.toResponse(recovered)
      }
    )
  }

  toResponse(
    user: User
  ): UserResponseDto {
    return this.toResponseDto(
      user,
      this.mapAreas(user)
    )
  }

  async createPending(
    dto: CreateUserDto,
    manager?: EntityManager,
    actorUserId: string | null = null
  ): Promise<UserResponseDto> {
    if (manager) {
      return this.createPendingWithManager(
        dto,
        manager,
        actorUserId
      )
    }

    return this.dataSource.transaction(
      async transactionManager => {
        return this.createPendingWithManager(
          dto,
          transactionManager,
          actorUserId
        )
      }
    )
  }

  async findForAuthentication(
    email: string
  ): Promise<UserForAuthentication | null> {
    const normalizedEmail = email.trim().toLowerCase()
  
    const user = await this.usersRepository.findByEmail(
      normalizedEmail
    )
  
    if (!user) {
      return null
    }
  
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      passwordHash: user.passwordHash,
      isActive: user.isActive,
      activatedAt: user.activatedAt
    }
  }

  async activatePendingUser(
    userId: string,
    passwordHash: string,
    activatedAt: Date,
    manager: EntityManager
  ): Promise<void> {
    const user =
      await this.usersRepository.findById(
        userId,
        manager
      )

    if (!user) {
      throw new ApiException({
        statusCode:
          HttpStatus.NOT_FOUND,
        code:
          ERROR_CODES.USER_NOT_FOUND,
        message:
          errorMessage(ERROR_CODES.USER_NOT_FOUND)
      })
    }

    if (
      user.isActive ||
      user.passwordHash !== null ||
      user.activatedAt !== null
    ) {
      throw new ApiException({
        statusCode:
          HttpStatus.CONFLICT,
        code:
          ERROR_CODES.USER_ALREADY_ACTIVATED,
        message:
          errorMessage(ERROR_CODES.USER_ALREADY_ACTIVATED)
      })
    }

    const before = {
      isActive:
        user.isActive,
      activatedAt:
        user.activatedAt
    }
    user.passwordHash =
      passwordHash
    user.isActive =
      true
    user.activatedAt =
      activatedAt

    await this.usersRepository.save(
      user,
      manager
    )

    await this.auditService.create(
      {
        action:
          AuditAction.USER_ACTIVATED,
        entityType:
          AuditEntityType.USER,
        entityId:
          user.id,
        actorUserId:
          user.id,
        targetSnapshot: {
          name:
            `${user.firstName} ${user.lastName}`,
          email:
            user.email
        },
        before,
        after: {
          isActive:
            true,
          activatedAt
        }
      },
      manager
    )
  }

  private async createPendingWithManager(
    dto: CreateUserDto,
    manager: EntityManager,
    actorUserId: string | null = null
  ): Promise<UserResponseDto> {
    const email =
      dto.email
        .trim()
        .toLowerCase()

    const existingUser =
      await this.usersRepository
        .findByEmailIncludingDeleted(
          email,
          manager
        )

    if (existingUser) {
      throw new ApiException({
        statusCode:
          HttpStatus.CONFLICT,
        code:
          ERROR_CODES.USER_EMAIL_ALREADY_EXISTS,
        message:
          errorMessage(ERROR_CODES.USER_EMAIL_ALREADY_EXISTS)
      })
    }

    const hasPhoneCountryCode =
      Boolean(
        dto.phoneCountryCode
      )

    const hasPhone =
      Boolean(
        dto.phone
      )

    if (
      hasPhoneCountryCode !==
      hasPhone
    ) {
      throw new ApiException({
        statusCode:
          HttpStatus.BAD_REQUEST,
        code:
          ERROR_CODES.USER_PHONE_INCOMPLETE,
        message:
          errorMessage(ERROR_CODES.USER_PHONE_INCOMPLETE)
      })
    }

    const areas =
      await this.areasService.findActiveByIds(
        dto.areaIds,
        manager
      )

    if (
      areas.length !==
      dto.areaIds.length
    ) {
      throw new ApiException({
        statusCode:
          HttpStatus.BAD_REQUEST,

        code:
          ERROR_CODES.USER_INVALID_AREAS,

        message:
          errorMessage(ERROR_CODES.USER_INVALID_AREAS)
      })
    }

    const user =
      this.usersRepository.create(
        {
          email,
          firstName:
            dto.firstName,
          lastName:
            dto.lastName,
          phoneCountryCode:
            dto.phoneCountryCode ??
            null,
          phone:
            dto.phone ??
            null,
          passwordHash:
            null,
          isActive:
            false,
          activatedAt:
            null
        },
        manager
      )

    const savedUser =
      await this.usersRepository.save(
        user,
        manager
      )

    const userAreas =
      this.userAreasRepository.createMany(
        savedUser.id,
        dto.areaIds,
        manager
      )

    await this.userAreasRepository.saveMany(
      userAreas,
      manager
    )

    await this.auditService.create(
      {
        action:
          AuditAction.USER_CREATED,
        entityType:
          AuditEntityType.USER,
        entityId:
          savedUser.id,
        ...(actorUserId ? { actorUserId } : {}),
        targetSnapshot: {
          name:
            `${savedUser.firstName} ${savedUser.lastName}`,
          email:
            savedUser.email
        },
        after: {
          email:
            savedUser.email,
          firstName:
            savedUser.firstName,
          lastName:
            savedUser.lastName,
          isActive:
            savedUser.isActive,
          areaIds:
            dto.areaIds
        }
      },
      manager
    )

    return this.toResponseDto(
      savedUser,
      areas.map((area) => ({
        id: area.id,
        name: area.name
      }))
    )
  }

  private applyUserChanges(
    user: User,
    currentAreaIds: string[],
    dto: UpdateUserDto
  ): {
    firstName: string
    lastName: string
    phoneCountryCode: string | null
    phone: string | null
    isActive: boolean
    areaIds?: string[]
    hasChanges: boolean
  } {
    const firstName = dto.firstName ?? user.firstName
    const lastName = dto.lastName ?? user.lastName
    const phoneCountryCode = dto.phoneCountryCode !== undefined
      ? this.emptyToNull(dto.phoneCountryCode)
      : user.phoneCountryCode
    const phone = dto.phone !== undefined
      ? this.emptyToNull(dto.phone)
      : user.phone
    const isActive = dto.isActive ?? user.isActive
    const areasChanged = dto.areaIds !== undefined &&
      !this.sameIds(currentAreaIds, dto.areaIds)

    return {
      firstName,
      lastName,
      phoneCountryCode,
      phone,
      isActive,
      areaIds: areasChanged ? dto.areaIds : undefined,
      hasChanges:
        firstName !== user.firstName ||
        lastName !== user.lastName ||
        phoneCountryCode !== user.phoneCountryCode ||
        phone !== user.phone ||
        isActive !== user.isActive ||
        areasChanged
    }
  }

  private emptyToNull(
    value: string | null
  ): string | null {
    if (value === null) {
      return null
    }

    const trimmed = value.trim()

    return trimmed.length === 0 ? null : trimmed
  }

  private assertPhonePair(
    phoneCountryCode: string | null,
    phone: string | null
  ): void {
    if (Boolean(phoneCountryCode) !== Boolean(phone)) {
      throw new ApiException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.USER_PHONE_INCOMPLETE,
        message: errorMessage(ERROR_CODES.USER_PHONE_INCOMPLETE)
      })
    }
  }

  private async assertActiveAreas(
    areaIds: string[],
    manager?: EntityManager
  ): Promise<Area[]> {
    const areas = await this.areasService.findActiveByIds(
      areaIds,
      manager
    )

    if (areas.length !== areaIds.length) {
      throw new ApiException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.USER_INVALID_AREAS,
        message: errorMessage(ERROR_CODES.USER_INVALID_AREAS)
      })
    }

    return areas
  }

  private sameIds(
    left: string[],
    right: string[]
  ): boolean {
    const sortedLeft = [...left].sort()
    const sortedRight = [...right].sort()

    return sortedLeft.join() === sortedRight.join()
  }

  private mapAreas(
    user: User
  ): UserAreaResponseDto[] {
    return (user.userAreas ?? [])
      .flatMap((userArea) =>
        userArea.area
          ? [{
              id: userArea.area.id,
              name: userArea.area.name
            }]
          : []
      )
      .sort((left, right) =>
        left.name.localeCompare(right.name)
      )
  }

  private userNotFoundException(): ApiException {
    return new ApiException({
      statusCode: HttpStatus.NOT_FOUND,
      code: ERROR_CODES.USER_NOT_FOUND,
      message: errorMessage(ERROR_CODES.USER_NOT_FOUND)
    })
  }

  private toResponseDto(
    user: User,
    areas: UserAreaResponseDto[]
  ): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneCountryCode: user.phoneCountryCode,
      phone: user.phone,
      isActive: user.isActive,
      activatedAt: user.activatedAt,
      areas,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }
}