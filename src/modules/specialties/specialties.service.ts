import { HttpStatus, Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'

import { AuditService } from '../audit/audit.service.js'
import { AuditAction } from '../audit/enums/audit-action.enum.js'
import { AuditEntityType } from '../audit/enums/audit-entity-type.enum.js'
import { ERROR_CODES } from '../../common/http/constants/error-codes.js'
import { ApiException } from '../../common/http/exceptions/api.exception.js'
import { errorMessage } from '../../common/http/messages/error-message.catalog.js'
import { createPaginationMeta, paginated } from '../../common/http/helpers/api-response.helper.js'
import { CreateSpecialtyDto } from './dto/create-specialty.dto.js'
import { ListSpecialtiesQueryDto } from './dto/list-specialties-query.dto.js'
import { SpecialtyResponseDto } from './dto/specialty-response.dto.js'
import { UpdateSpecialtyDto } from './dto/update-specialty.dto.js'
import { Specialty } from './entities/specialty.entity.js'
import { SpecialtiesRepository } from './repositories/specialties.repository.js'

@Injectable()
export class SpecialtiesService {
  constructor(
    private readonly specialtiesRepository: SpecialtiesRepository,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource
  ) {}

  async findAll(filters: ListSpecialtiesQueryDto) {
    const { items, totalItems } = await this.specialtiesRepository.findAll({
      isActive: filters.isActive,
      search: filters.search,
      page: filters.page,
      limit: filters.limit
    })

    return paginated(
      items.map((specialty) => this.toResponseDto(specialty)),
      createPaginationMeta({
        page: filters.page,
        limit: filters.limit,
        totalItems
      })
    )
  }

  async findById(id: string): Promise<SpecialtyResponseDto> {
    const specialty = await this.specialtiesRepository.findById(id)

    if (!specialty) {
      throw this.notFound()
    }

    return this.toResponseDto(specialty)
  }

  async create(
    dto: CreateSpecialtyDto,
    actorUserId: string | null = null
  ): Promise<SpecialtyResponseDto> {
    const name = dto.name.trim()
    const existing = await this.specialtiesRepository.findByName(name)

    if (existing) {
      throw this.nameExists()
    }

    return this.dataSource.transaction(async (manager) => {
      const saved = await this.specialtiesRepository.save(
        this.specialtiesRepository.create(
          {
            name,
            isActive: true
          },
          manager
        ),
        manager
      )

      await this.auditService.create(
        {
          action: AuditAction.SPECIALTY_CREATED,
          entityType: AuditEntityType.SPECIALTY,
          entityId: saved.id,
          ...(actorUserId ? { actorUserId } : {}),
          targetSnapshot: {
            name: saved.name
          },
          after: {
            name: saved.name,
            isActive: saved.isActive
          }
        },
        manager
      )

      return this.toResponseDto(saved)
    })
  }

  async update(
    id: string,
    dto: UpdateSpecialtyDto,
    actorUserId: string | null = null
  ): Promise<SpecialtyResponseDto> {
    const specialty = await this.specialtiesRepository.findById(id)

    if (!specialty) {
      throw this.notFound()
    }

    if (dto.name !== undefined) {
      const existing = await this.specialtiesRepository.findByName(dto.name)

      if (existing && existing.id !== specialty.id) {
        throw this.nameExists()
      }
    }

    const before = {
      name: specialty.name,
      isActive: specialty.isActive
    }

    if (dto.name !== undefined) {
      specialty.name = dto.name
    }

    if (dto.isActive !== undefined) {
      specialty.isActive = dto.isActive
    }

    if (before.name === specialty.name && before.isActive === specialty.isActive) {
      return this.toResponseDto(specialty)
    }

    return this.dataSource.transaction(async (manager) => {
      const saved = await this.specialtiesRepository.save(specialty, manager)
      const onlyStatusChanged = before.name === saved.name && before.isActive !== saved.isActive

      await this.auditService.create(
        {
          action: onlyStatusChanged
            ? saved.isActive
              ? AuditAction.SPECIALTY_ACTIVATED
              : AuditAction.SPECIALTY_DEACTIVATED
            : AuditAction.SPECIALTY_UPDATED,
          entityType: AuditEntityType.SPECIALTY,
          entityId: saved.id,
          ...(actorUserId ? { actorUserId } : {}),
          targetSnapshot: {
            name: saved.name
          },
          before,
          after: {
            name: saved.name,
            isActive: saved.isActive
          }
        },
        manager
      )

      return this.toResponseDto(saved)
    })
  }

  private toResponseDto(specialty: Specialty): SpecialtyResponseDto {
    return {
      id: specialty.id,
      name: specialty.name,
      isActive: specialty.isActive,
      createdAt: specialty.createdAt,
      updatedAt: specialty.updatedAt
    }
  }

  private notFound(): ApiException {
    return new ApiException({
      statusCode: HttpStatus.NOT_FOUND,
      code: ERROR_CODES.SPECIALTY_NOT_FOUND,
      message: errorMessage(ERROR_CODES.SPECIALTY_NOT_FOUND)
    })
  }

  private nameExists(): ApiException {
    return new ApiException({
      statusCode: HttpStatus.CONFLICT,
      code: ERROR_CODES.SPECIALTY_NAME_ALREADY_EXISTS,
      message: errorMessage(ERROR_CODES.SPECIALTY_NAME_ALREADY_EXISTS)
    })
  }
}
