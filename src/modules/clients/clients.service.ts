import { HttpStatus, Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { AuditService } from '../audit/audit.service.js'
import { AuditAction } from '../audit/enums/audit-action.enum.js'
import { AuditEntityType } from '../audit/enums/audit-entity-type.enum.js'
import { ERROR_CODES } from '../../common/http/constants/error-codes.js'
import { ApiException } from '../../common/http/exceptions/api.exception.js'
import { errorMessage } from '../../common/http/messages/error-message.catalog.js'
import {
  createPaginationMeta,
  paginated
} from '../../common/http/helpers/api-response.helper.js'
import { CreateClientDto } from './dto/create-client.dto.js'
import { UpdateClientDto } from './dto/update-client.dto.js'
import { ListClientsQueryDto } from './dto/list-clients-query.dto.js'
import { ClientResponseDto } from './dto/client-response.dto.js'
import { DeleteClientResponseDto } from './dto/delete-client-response.dto.js'
import { Client } from './entities/client.entity.js'
import { ClientsRepository } from './repositories/clients.repository.js'
import { ContactsRepository } from '../contacts/repositories/contacts.repository.js'

@Injectable()
export class ClientsService {
  constructor(
    private readonly repository: ClientsRepository,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
    private readonly contactsRepository: ContactsRepository
  ) {}

  async findAll(filters: ListClientsQueryDto) {
    const { items, totalItems } = await this.repository.findAll(filters)
    return paginated(
      items.map((entity) => this.toResponseDto(entity)),
      createPaginationMeta({
        page: filters.page,
        limit: filters.limit,
        totalItems
      })
    )
  }

  async findById(id: string): Promise<ClientResponseDto> {
    const entity = await this.repository.findById(id)
    if (!entity) throw this.notFoundException()
    return this.toResponseDto(entity)
  }

  async create(
    dto: CreateClientDto,
    actorUserId: string | null = null
  ): Promise<ClientResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const entity = this.repository.create(
        {
          name: dto.name,
          isActive: dto.isActive ?? true,
          rfc: dto.rfc ?? null,
          sapNumber: dto.sapNumber ?? null
        },
        manager
      )
      const saved = await this.repository.save(entity, manager)
      await this.auditService.create(
        {
          action: AuditAction.CLIENT_CREATED,
          entityType: AuditEntityType.CLIENT,
          entityId: saved.id,
          ...(actorUserId ? { actorUserId } : {}),
          targetSnapshot: { name: saved.name },
          after: this.snapshot(saved)
        },
        manager
      )
      return this.toResponseDto(saved)
    })
  }

  async update(
    id: string,
    dto: UpdateClientDto,
    actorUserId: string | null = null
  ): Promise<ClientResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const entity = await this.repository.findByIdForUpdate(id, manager)
      if (!entity) throw this.notFoundException()
      const before = this.snapshot(entity)
      if (dto.name !== undefined) entity.name = dto.name
      if (dto.rfc !== undefined) entity.rfc = dto.rfc
      if (dto.sapNumber !== undefined) entity.sapNumber = dto.sapNumber
      if (dto.isActive !== undefined) entity.isActive = dto.isActive
      const after = this.snapshot(entity)
      if (JSON.stringify(before) === JSON.stringify(after))
        return this.toResponseDto(entity)
      const saved = await this.repository.save(entity, manager)
      const onlyStatusChanged =
        before.name === after.name &&
        before.rfc === after.rfc &&
        before.sapNumber === after.sapNumber &&
        before.isActive !== after.isActive
      const action = onlyStatusChanged
        ? saved.isActive
          ? AuditAction.CLIENT_ACTIVATED
          : AuditAction.CLIENT_DEACTIVATED
        : AuditAction.CLIENT_UPDATED
      await this.auditService.create(
        {
          action,
          entityType: AuditEntityType.CLIENT,
          entityId: saved.id,
          ...(actorUserId ? { actorUserId } : {}),
          targetSnapshot: { name: saved.name },
          before,
          after: this.snapshot(saved)
        },
        manager
      )
      return this.toResponseDto(saved)
    })
  }

  async remove(
    id: string,
    actorUserId: string | null = null
  ): Promise<DeleteClientResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const entity = await this.repository.findByIdForUpdate(id, manager)
      if (!entity) throw this.notFoundException()
      const contacts = await this.contactsRepository.findByClientId(id, manager)
      for (const contact of contacts) {
        const removedContact = await this.contactsRepository.softRemove(
          contact,
          manager
        )
        await this.auditService.create(
          {
            action: AuditAction.CONTACT_DELETED,
            entityType: AuditEntityType.CONTACT,
            entityId: contact.id,
            ...(actorUserId ? { actorUserId } : {}),
            targetSnapshot: { name: contact.name, clientId: id },
            before: { deletedAt: null },
            after: { deletedAt: removedContact.deletedAt },
            metadata: { reason: 'client_deleted' }
          },
          manager
        )
      }
      const removed = await this.repository.softRemove(entity, manager)
      await this.auditService.create(
        {
          action: AuditAction.CLIENT_DELETED,
          entityType: AuditEntityType.CLIENT,
          entityId: removed.id,
          ...(actorUserId ? { actorUserId } : {}),
          targetSnapshot: { name: removed.name },
          before: { deletedAt: null },
          after: { deletedAt: removed.deletedAt }
        },
        manager
      )
      return { id: removed.id, deletedAt: removed.deletedAt! }
    })
  }

  private notFoundException(): ApiException {
    return new ApiException({
      statusCode: HttpStatus.NOT_FOUND,
      code: ERROR_CODES.CLIENT_NOT_FOUND,
      message: errorMessage(ERROR_CODES.CLIENT_NOT_FOUND)
    })
  }

  private snapshot(entity: Client) {
    return {
      name: entity.name,
      rfc: entity.rfc,
      sapNumber: entity.sapNumber,
      isActive: entity.isActive
    }
  }

  private toResponseDto(entity: Client): ClientResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      rfc: entity.rfc,
      sapNumber: entity.sapNumber,
      registeredAt: entity.registeredAt,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }
}
