import {
    HttpStatus,
    Injectable
  } from '@nestjs/common'
  import { DataSource } from 'typeorm'
  
  import { ApiException } from '../../common/http/exceptions/api.exception.js'
  import { ERROR_CODES } from '../../common/http/constants/error-codes.js'
  
  import { AreasService } from '../areas/areas.service.js'
  import { AuditService } from '../audit/audit.service.js'
  import { AuditAction } from '../audit/enums/audit-action.enum.js'
  import { AuditEntityType } from '../audit/enums/audit-entity-type.enum.js'
  
  import { CreateUserDto } from './dto/create-user.dto.js'
  import { UserResponseDto } from './dto/user-response.dto.js'
  import { UserAreasRepository } from './repositories/user-areas.repository.js'
  import { UsersRepository } from './repositories/users.repository.js'
  
  @Injectable()
  export class UsersService {
    constructor(
      private readonly usersRepository: UsersRepository,
      private readonly userAreasRepository: UserAreasRepository,
      private readonly areasService: AreasService,
      private readonly auditService: AuditService,
      private readonly dataSource: DataSource
    ) {}
  
    async createPending(
      dto: CreateUserDto
    ): Promise<UserResponseDto> {
      const email = dto.email.trim().toLowerCase()
  
      const existingUser =
        await this.usersRepository.findByEmailIncludingDeleted(
          email
        )
  
      if (existingUser) {
        throw new ApiException({
          statusCode: HttpStatus.CONFLICT,
          code: ERROR_CODES.USER_EMAIL_ALREADY_EXISTS,
          message: 'Email already registered'
        })
      }
  
      const hasPhone = Boolean(dto.phone)
      const hasCountryCode = Boolean(dto.phoneCountryCode)
  
      if (hasPhone !== hasCountryCode) {
        throw new ApiException({
          statusCode: HttpStatus.BAD_REQUEST,
          code: ERROR_CODES.USER_PHONE_INCOMPLETE,
          message: 'Phone and country code must be provided together'
        })
      }
  
      const areas =
        await this.areasService.findActiveByIds(dto.areaIds)
  
      if (areas.length !== dto.areaIds.length) {
        throw new ApiException({
          statusCode: HttpStatus.BAD_REQUEST,
          code: ERROR_CODES.USER_INVALID_AREAS,
          message: 'One or more areas are invalid or inactive'
        })
      }
  
      return this.dataSource.transaction(
        async (manager) => {
          const user = this.usersRepository.create(
            {
              email,
              firstName: dto.firstName,
              lastName: dto.lastName,
  
              phoneCountryCode:
                dto.phoneCountryCode ?? null,
  
              phone:
                dto.phone ?? null,
  
              passwordHash: null,
              isActive: false,
              activatedAt: null
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
              action: AuditAction.USER_CREATED,
              entityType: AuditEntityType.USER,
              entityId: savedUser.id,
  
              targetSnapshot: {
                name: `${savedUser.firstName} ${savedUser.lastName}`,
                email: savedUser.email
              },
  
              after: {
                email: savedUser.email,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                isActive: savedUser.isActive,
                areaIds: dto.areaIds
              }
            },
            manager
          )
  
          return {
            id: savedUser.id,
            email: savedUser.email,
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            phoneCountryCode:
              savedUser.phoneCountryCode,
            phone: savedUser.phone,
            isActive: savedUser.isActive,
            activatedAt: savedUser.activatedAt,
  
            areas: areas.map((area) => ({
              id: area.id,
              name: area.name
            })),
  
            createdAt: savedUser.createdAt,
            updatedAt: savedUser.updatedAt
          }
        }
      )
    }
  }