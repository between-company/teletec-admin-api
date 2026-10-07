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
  ListUsersQueryDto
} from './dto/list-users-query.dto.js'

import {
  UserAreaResponseDto,
  UserResponseDto
} from './dto/user-response.dto.js'

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
      this.toResponseDto(
        user,
        (user.userAreas ?? [])
          .map((userArea) => ({
            id: userArea.area.id,
            name: userArea.area.name
          }))
          .sort((left, right) =>
            left.name.localeCompare(right.name)
          )
      )
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

  async createPending(
    dto: CreateUserDto,
    manager?: EntityManager
  ): Promise<UserResponseDto> {
    if (manager) {
      return this.createPendingWithManager(
        dto,
        manager
      )
    }

    return this.dataSource.transaction(
      async transactionManager => {
        return this.createPendingWithManager(
          dto,
          transactionManager
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
          'User not found'
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
          'User has already been activated'
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
    manager: EntityManager
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
          'Email already registered'
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
          'Phone and country code must be provided together'
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
          'One or more areas are invalid or inactive'
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