import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  EntityManager,
  ILike,
  In,
  Repository
} from 'typeorm'

import { Area } from '../entities/area.entity.js'

@Injectable()
export class AreasRepository {
  constructor(
    @InjectRepository(Area)
    private readonly repository: Repository<Area>
  ) {}

  async findAll(filters: {
    isActive?: boolean
    search?: string
    page: number
    limit: number
  }): Promise<{
    items: Area[]
    totalItems: number
  }> {
    const where = {
      ...(filters.isActive !== undefined
        ? { isActive: filters.isActive }
        : {}),
      ...(filters.search
        ? {
            name: ILike(`%${filters.search}%`)
          }
        : {})
    }
  
    const [items, totalItems] =
      await this.repository.findAndCount({
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

  findById(
    id: string,
    manager?: EntityManager
  ): Promise<Area | null> {
    return this.getRepository(manager).findOne({
      where: {
        id
      }
    })
  }

  findByName(
    name: string,
    manager?: EntityManager
  ): Promise<Area | null> {
    return this.getRepository(manager).findOne({
      where: {
        name: ILike(name)
      }
    })
  }

  create(
    data: Partial<Area>,
    manager?: EntityManager
  ): Area {
    return this.getRepository(manager).create(data)
  }

  save(
    area: Area,
    manager?: EntityManager
  ): Promise<Area> {
    return this.getRepository(manager).save(area)
  }

  findActiveByIds(
    ids: string[],
    manager?: EntityManager
  ): Promise<Area[]> {
    return this.getRepository(manager).find({
      where: {
        id: In(ids),
        isActive: true
      }
    })
  }

  private getRepository(
    manager?: EntityManager
  ): Repository<Area> {
    return manager
      ? manager.getRepository(Area)
      : this.repository
  }
}