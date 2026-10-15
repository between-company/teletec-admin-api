import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, ILike, Repository } from 'typeorm'
import { Contact } from '../entities/contact.entity.js'
import { ListContactsQueryDto } from '../dto/list-contacts-query.dto.js'

@Injectable()
export class ContactsRepository {
  constructor(
    @InjectRepository(Contact) private readonly repository: Repository<Contact>
  ) {}

  async findAll(clientId: string, filters: ListContactsQueryDto) {
    const [items, totalItems] = await this.repository.findAndCount({
      where: {
        ...(filters.isActive !== undefined
          ? { isActive: filters.isActive }
          : {}),
        ...(filters.search ? { name: ILike(`%${filters.search}%`) } : {}),
        clientId,
        ...(filters.type ? { type: filters.type } : {})
      },
      order: { name: 'ASC', id: 'ASC' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    })
    return { items, totalItems }
  }

  findById(
    clientId: string,
    id: string,
    manager?: EntityManager
  ): Promise<Contact | null> {
    return this.getRepository(manager).findOne({ where: { id, clientId } })
  }

  findByIdForUpdate(
    clientId: string,
    id: string,
    manager: EntityManager
  ): Promise<Contact | null> {
    return this.getRepository(manager).findOne({
      where: { id, clientId },
      lock: { mode: 'pessimistic_write' }
    })
  }

  create(data: Partial<Contact>, manager?: EntityManager): Contact {
    return this.getRepository(manager).create(data)
  }

  save(entity: Contact, manager?: EntityManager): Promise<Contact> {
    return this.getRepository(manager).save(entity)
  }

  softRemove(entity: Contact, manager: EntityManager): Promise<Contact> {
    return this.getRepository(manager).softRemove(entity)
  }

  findByClientId(clientId: string, manager: EntityManager): Promise<Contact[]> {
    return this.getRepository(manager).find({
      where: { clientId },
      order: { id: 'ASC' },
      lock: { mode: 'pessimistic_write' }
    })
  }

  private getRepository(manager?: EntityManager): Repository<Contact> {
    return manager ? manager.getRepository(Contact) : this.repository
  }
}
