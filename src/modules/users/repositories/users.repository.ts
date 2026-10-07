import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  Brackets,
  EntityManager,
  In,
  Repository
} from 'typeorm'

import { User } from '../entities/user.entity.js'

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>
  ) {}

  async findAll(filters: {
    isActive?: boolean
    search?: string
    areaId?: string
    page: number
    limit: number
  }): Promise<{
    items: User[]
    totalItems: number
  }> {
    const filtered = this.repository.createQueryBuilder('user')

    if (filters.areaId) {
      filtered.innerJoin(
        'user.userAreas',
        'membership',
        'membership.areaId = :areaId',
        { areaId: filters.areaId }
      )
    }

    if (filters.isActive !== undefined) {
      filtered.andWhere('user.isActive = :isActive', {
        isActive: filters.isActive
      })
    }

    if (filters.search) {
      const search = `%${filters.search}%`

      filtered.andWhere(
        new Brackets((searchQuery) => {
          searchQuery
            .where('user.email ILIKE :search', { search })
            .orWhere('user.firstName ILIKE :search', { search })
            .orWhere('user.lastName ILIKE :search', { search })
        })
      )
    }

    const totalItems = await filtered.clone().getCount()

    const pageUsers = await filtered
      .clone()
      .select([
        'user.id',
        'user.lastName',
        'user.firstName'
      ])
      .orderBy('user.lastName', 'ASC')
      .addOrderBy('user.firstName', 'ASC')
      .addOrderBy('user.id', 'ASC')
      .offset((filters.page - 1) * filters.limit)
      .limit(filters.limit)
      .getMany()

    if (pageUsers.length === 0) {
      return {
        items: [],
        totalItems
      }
    }

    const ids = pageUsers.map((user) => user.id)

    const users = await this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userAreas', 'userArea')
      .leftJoinAndSelect('userArea.area', 'area')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.phoneCountryCode',
        'user.phone',
        'user.isActive',
        'user.activatedAt',
        'user.createdAt',
        'user.updatedAt',
        'userArea.id',
        'userArea.userId',
        'userArea.areaId',
        'area.id',
        'area.name'
      ])
      .where({
        id: In(ids)
      })
      .getMany()

    const usersById = new Map(
      users.map((user) => [user.id, user])
    )

    return {
      items: ids.flatMap((id) => {
        const user = usersById.get(id)

        return user ? [user] : []
      }),
      totalItems
    }
  }

  findByIdWithAreas(
    id: string
  ): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userAreas', 'userArea')
      .leftJoinAndSelect('userArea.area', 'area')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.phoneCountryCode',
        'user.phone',
        'user.isActive',
        'user.activatedAt',
        'user.createdAt',
        'user.updatedAt',
        'userArea.id',
        'userArea.userId',
        'userArea.areaId',
        'area.id',
        'area.name'
      ])
      .where('user.id = :id', { id })
      .getOne()
  }

  findByIdForUpdate(
    id: string,
    manager: EntityManager,
    withDeleted = false
  ): Promise<User | null> {
    return manager.getRepository(User).findOne({
      where: {
        id
      },
      withDeleted,
      lock: {
        mode: 'pessimistic_write'
      }
    })
  }

  softRemove(
    user: User,
    manager: EntityManager
  ): Promise<User> {
    return manager.getRepository(User).softRemove(user)
  }

  recover(
    user: User,
    manager: EntityManager
  ): Promise<User> {
    return manager.getRepository(User).recover(user)
  }

  findById(
    id: string,
    manager?: EntityManager
  ): Promise<User | null> {
    return this.getRepository(manager).findOne({
      where: {
        id
      }
    })
  }

  findByEmail(
    email: string,
    manager?: EntityManager
  ): Promise<User | null> {
    return this.getRepository(manager).findOne({
      where: {
        email
      }
    })
  }

  findByEmailIncludingDeleted(
    email: string,
    manager?: EntityManager
  ): Promise<User | null> {
    return this.getRepository(manager).findOne({
      where: {
        email
      },
      withDeleted: true
    })
  }

  create(
    data: Partial<User>,
    manager?: EntityManager
  ): User {
    return this.getRepository(manager).create(data)
  }

  save(
    user: User,
    manager?: EntityManager
  ): Promise<User> {
    return this.getRepository(manager).save(user)
  }

  private getRepository(
    manager?: EntityManager
  ): Repository<User> {
    return manager
      ? manager.getRepository(User)
      : this.repository
  }
}