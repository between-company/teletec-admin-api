import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, ILike, Repository } from 'typeorm'

import { Specialty } from '../entities/specialty.entity.js'

@Injectable()
export class SpecialtiesRepository {
  constructor(
    @InjectRepository(Specialty)
    private readonly repository: Repository<Specialty>
  ) {}

  async findAll(filters: {
    isActive?: boolean
    search?: string
    page: number
    limit: number
  }): Promise<{
    items: Specialty[]
    totalItems: number
  }> {
    const where = {
      ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
      ...(filters.search
        ? {
            name: ILike(`%${filters.search}%`)
          }
        : {})
    }

    const [items, totalItems] = await this.repository.findAndCount({
      where,
      order: {
        name: 'ASC'
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    })

    return {
      items,
      totalItems
    }
  }

  findById(id: string, manager?: EntityManager): Promise<Specialty | null> {
    return this.getRepository(manager).findOne({
      where: {
        id
      }
    })
  }

  findByName(name: string, manager?: EntityManager): Promise<Specialty | null> {
    return this.getRepository(manager).findOne({
      where: {
        name: ILike(name)
      }
    })
  }

  create(data: Partial<Specialty>, manager?: EntityManager): Specialty {
    return this.getRepository(manager).create(data)
  }

  save(specialty: Specialty, manager?: EntityManager): Promise<Specialty> {
    return this.getRepository(manager).save(specialty)
  }

  private getRepository(manager?: EntityManager): Repository<Specialty> {
    return manager ? manager.getRepository(Specialty) : this.repository
  }
}
