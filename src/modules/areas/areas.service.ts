import {
    HttpStatus,
    Injectable
  } from '@nestjs/common'
  import { DataSource, EntityManager } from 'typeorm'
  
  import { AuditService } from '../audit/audit.service.js'
  import { AuditAction } from '../audit/enums/audit-action.enum.js'
  import { AuditEntityType } from '../audit/enums/audit-entity-type.enum.js'
  
  import { ERROR_CODES } from '../../common/http/constants/error-codes.js'
  import { ApiException } from '../../common/http/exceptions/api.exception.js'
  import { errorMessage } from '../../common/http/messages/error-message.catalog.js'
  
  import { CreateAreaDto } from './dto/create-area.dto.js'
  import { AreaResponseDto } from './dto/area-response.dto.js'
  import { Area } from './entities/area.entity.js'
  import { AreasRepository } from './repositories/areas.repository.js'
  import { UpdateAreaDto } from './dto/update-area.dto.js'
  import { ListAreasQueryDto } from './dto/list-areas-query.dto.js'
  import {
    createPaginationMeta,
    paginated
  } from '../../common/http/helpers/api-response.helper.js'
  
  @Injectable()
  export class AreasService {
    constructor(
      private readonly areasRepository: AreasRepository,
      private readonly auditService: AuditService,
      private readonly dataSource: DataSource
    ) {}

    async findAll(filters: ListAreasQueryDto) {
      const {
        items,
        totalItems
      } = await this.areasRepository.findAll({
        isActive: filters.isActive,
        search: filters.search,
        page: filters.page,
        limit: filters.limit
      })
    
      const data = items.map((area) =>
        this.toResponseDto(area)
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
    ): Promise<AreaResponseDto> {
      const area =
        await this.areasRepository.findById(id)
    
      if (!area) {
        throw new ApiException({
          statusCode: HttpStatus.NOT_FOUND,
          code: ERROR_CODES.AREA_NOT_FOUND,
          message: errorMessage(ERROR_CODES.AREA_NOT_FOUND)
        })
      }
    
      return this.toResponseDto(area)
    }

    async create(
      dto: CreateAreaDto
    ): Promise<AreaResponseDto> {
      const name = dto.name.trim()
  
      const existingArea =
        await this.areasRepository.findByName(name)
  
      if (existingArea) {
        throw new ApiException({
          statusCode: HttpStatus.CONFLICT,
          code: ERROR_CODES.AREA_NAME_ALREADY_EXISTS,
          message: errorMessage(ERROR_CODES.AREA_NAME_ALREADY_EXISTS)
        })
      }
  
      return this.dataSource.transaction(
        async (manager) => {
          const area = this.areasRepository.create(
            {
              name,
              isActive: true
            },
            manager
          )
  
          const savedArea =
            await this.areasRepository.save(
              area,
              manager
            )
  
          await this.auditService.create(
            {
              action: AuditAction.AREA_CREATED,
              entityType: AuditEntityType.AREA,
              entityId: savedArea.id,
  
              targetSnapshot: {
                name: savedArea.name
              },
  
              after: {
                name: savedArea.name,
                isActive: savedArea.isActive
              }
            },
            manager
          )
  
          return this.toResponseDto(savedArea)
        }
      )
    }

    async update(
      id: string,
      dto: UpdateAreaDto
    ): Promise<AreaResponseDto> {
      const area = await this.areasRepository.findById(id)
    
      if (!area) {
        throw new ApiException({
          statusCode: HttpStatus.NOT_FOUND,
          code: ERROR_CODES.AREA_NOT_FOUND,
          message: errorMessage(ERROR_CODES.AREA_NOT_FOUND)
        })
      }
    
      if (dto.name !== undefined) {
        const existingArea =
          await this.areasRepository.findByName(dto.name)
    
        if (
          existingArea &&
          existingArea.id !== area.id
        ) {
          throw new ApiException({
            statusCode: HttpStatus.CONFLICT,
            code: ERROR_CODES.AREA_NAME_ALREADY_EXISTS,
            message: errorMessage(ERROR_CODES.AREA_NAME_ALREADY_EXISTS)
          })
        }
      }
    
      const before = {
        name: area.name,
        isActive: area.isActive
      }
    
      if (dto.name !== undefined) {
        area.name = dto.name
      }
    
      if (dto.isActive !== undefined) {
        area.isActive = dto.isActive
      }
    
      const hasChanges =
        before.name !== area.name ||
        before.isActive !== area.isActive
    
      if (!hasChanges) {
        return this.toResponseDto(area)
      }
    
      return this.dataSource.transaction(
        async (manager) => {
          const savedArea =
            await this.areasRepository.save(
              area,
              manager
            )
    
          let action = AuditAction.AREA_UPDATED
    
          const onlyStatusChanged =
            before.name === savedArea.name &&
            before.isActive !== savedArea.isActive
    
          if (onlyStatusChanged) {
            action = savedArea.isActive
              ? AuditAction.AREA_ACTIVATED
              : AuditAction.AREA_DEACTIVATED
          }
    
          await this.auditService.create(
            {
              action,
              entityType: AuditEntityType.AREA,
              entityId: savedArea.id,
    
              targetSnapshot: {
                name: savedArea.name
              },
    
              before,
              after: {
                name: savedArea.name,
                isActive: savedArea.isActive
              }
            },
            manager
          )
    
          return this.toResponseDto(savedArea)
        }
      )
    }

    findActiveByIds(
      ids: string[],
      manager?: EntityManager
    ): Promise<Area[]> {
      return this.areasRepository.findActiveByIds(
        ids,
        manager
      )
    }
  
    private toResponseDto(
      area: Area
    ): AreaResponseDto {
      return {
        id: area.id,
        name: area.name,
        isActive: area.isActive,
        createdAt: area.createdAt,
        updatedAt: area.updatedAt
      }
    }
  }