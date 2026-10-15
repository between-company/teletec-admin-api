import { HttpStatus, Injectable } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
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
import { CreateContactDto } from './dto/create-contact.dto.js'
import { UpdateContactDto } from './dto/update-contact.dto.js'
import { ListContactsQueryDto } from './dto/list-contacts-query.dto.js'
import { ContactResponseDto } from './dto/contact-response.dto.js'
import { DeleteContactResponseDto } from './dto/delete-contact-response.dto.js'
import { Contact } from './entities/contact.entity.js'
import { ContactsRepository } from './repositories/contacts.repository.js'
import { ClientsRepository } from '../clients/repositories/clients.repository.js'

@Injectable()
export class ContactsService {
  constructor(
    private readonly repository: ContactsRepository,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
    private readonly clientsRepository: ClientsRepository
  ) {}

  async findAll(filters: ListContactsQueryDto) {
    if (filters.clientId) await this.assertClient(filters.clientId)
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

  async findById(id: string): Promise<ContactResponseDto> {
    const entity = await this.repository.findById(id)
    if (!entity) throw this.notFoundException()
    await this.assertClient(entity.clientId)
    return this.toResponseDto(entity)
  }

  async create(
    dto: CreateContactDto,
    actorUserId: string | null = null
  ): Promise<ContactResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      await this.assertClient(dto.clientId, manager)

      const entity = this.repository.create(
        {
          clientId: dto.clientId,
          name: dto.name,
          type: dto.type,
          isActive: dto.isActive ?? true,
          email: dto.email ?? null,
          phoneCountryCode: dto.phoneCountryCode ?? null,
          phone: dto.phone ?? null,
          officePhoneCountryCode: dto.officePhoneCountryCode ?? null,
          officePhone: dto.officePhone ?? null
        },
        manager
      )
      const saved = await this.repository.save(entity, manager)

      await this.auditService.create(
        {
          action: AuditAction.CONTACT_CREATED,
          entityType: AuditEntityType.CONTACT,
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
    dto: UpdateContactDto,
    actorUserId: string | null = null
  ): Promise<ContactResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const current = await this.repository.findById(id, manager)
      if (!current) throw this.notFoundException()
      await this.assertClient(current.clientId, manager)
      const entity = await this.repository.findByIdForUpdate(id, manager)
      if (!entity) throw this.notFoundException()
      const before = this.snapshot(entity)
      if (dto.name !== undefined) entity.name = dto.name
      if (dto.email !== undefined) entity.email = dto.email
      if (dto.phoneCountryCode !== undefined) entity.phoneCountryCode = dto.phoneCountryCode
      if (dto.phone !== undefined) entity.phone = dto.phone
      if (dto.officePhoneCountryCode !== undefined) entity.officePhoneCountryCode = dto.officePhoneCountryCode
      if (dto.officePhone !== undefined) entity.officePhone = dto.officePhone
      if (dto.type !== undefined) entity.type = dto.type
      if (dto.isActive !== undefined) entity.isActive = dto.isActive
      const after = this.snapshot(entity)
      if (JSON.stringify(before) === JSON.stringify(after))
        return this.toResponseDto(entity)
      const saved = await this.repository.save(entity, manager)
      const onlyStatusChanged =
        before.name === after.name &&
        before.email === after.email &&
        before.phoneCountryCode === after.phoneCountryCode &&
        before.phone === after.phone &&
        before.officePhoneCountryCode === after.officePhoneCountryCode &&
        before.officePhone === after.officePhone &&
        before.type === after.type &&
        before.isActive !== after.isActive
      const action = onlyStatusChanged
        ? saved.isActive
          ? AuditAction.CONTACT_ACTIVATED
          : AuditAction.CONTACT_DEACTIVATED
        : AuditAction.CONTACT_UPDATED
      await this.auditService.create(
        {
          action,
          entityType: AuditEntityType.CONTACT,
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
  ): Promise<DeleteContactResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const current = await this.repository.findById(id, manager)
      if (!current) throw this.notFoundException()
      await this.assertClient(current.clientId, manager)
      const entity = await this.repository.findByIdForUpdate(id, manager)
      if (!entity) throw this.notFoundException()
      const removed = await this.repository.softRemove(entity, manager)
      await this.auditService.create(
        {
          action: AuditAction.CONTACT_DELETED,
          entityType: AuditEntityType.CONTACT,
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

  private async assertClient(
    id: string,
    manager?: EntityManager
  ): Promise<void> {
    const client = manager
      ? await this.clientsRepository.findByIdForUpdate(id, manager)
      : await this.clientsRepository.findById(id)
    if (!client)
      throw new ApiException({
        statusCode: HttpStatus.NOT_FOUND,
        code: ERROR_CODES.CLIENT_NOT_FOUND,
        message: errorMessage(ERROR_CODES.CLIENT_NOT_FOUND)
      })
  }

  private notFoundException(): ApiException {
    return new ApiException({
      statusCode: HttpStatus.NOT_FOUND,
      code: ERROR_CODES.CONTACT_NOT_FOUND,
      message: errorMessage(ERROR_CODES.CONTACT_NOT_FOUND)
    })
  }

  private snapshot(entity: Contact) {
    return {
      clientId: entity.clientId,
      name: entity.name,
      email: entity.email,
      phoneCountryCode: entity.phoneCountryCode,
      phone: entity.phone,
      officePhoneCountryCode: entity.officePhoneCountryCode,
      officePhone: entity.officePhone,
      type: entity.type,
      isActive: entity.isActive
    }
  }

  private toResponseDto(entity: Contact): ContactResponseDto {
    return {
      id: entity.id,
      clientId: entity.clientId,
      name: entity.name,
      email: entity.email,
      phoneCountryCode: entity.phoneCountryCode,
      phone: entity.phone,
      officePhoneCountryCode: entity.officePhoneCountryCode,
      officePhone: entity.officePhone,
      type: entity.type,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }
}
