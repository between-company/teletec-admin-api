import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, ILike, Repository } from 'typeorm'
import { Client } from '../entities/client.entity.js'
import { ListClientsQueryDto } from '../dto/list-clients-query.dto.js'

@Injectable()
export class ClientsRepository {
  constructor(
    @InjectRepository(Client) private readonly repository: Repository<Client>
  ) {}

  async findAll(filters: ListClientsQueryDto) {
    const [items, totalItems] = await this.repository.findAndCount({
      where: {
        ...(filters.isActive !== undefined
          ? { isActive: filters.isActive }
          : {}),
        ...(filters.search ? { name: ILike(`%${filters.search}%`) } : {})
      },
      order: { name: 'ASC', id: 'ASC' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    })
    return { items, totalItems }
  }

  findById(id: string, manager?: EntityManager): Promise<Client | null> {
    return this.getRepository(manager).findOne({ where: { id } })
  }

  findByIdForUpdate(
    id: string,
    manager: EntityManager
  ): Promise<Client | null> {
    return this.getRepository(manager).findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' }
    })
  }

  create(data: Partial<Client>, manager?: EntityManager): Client {
    return this.getRepository(manager).create(data)
  }

  save(entity: Client, manager?: EntityManager): Promise<Client> {
    return this.getRepository(manager).save(entity)
  }

  softRemove(entity: Client, manager: EntityManager): Promise<Client> {
    return this.getRepository(manager).softRemove(entity)
  }

  private getRepository(manager?: EntityManager): Repository<Client> {
    return manager ? manager.getRepository(Client) : this.repository
  }
}
