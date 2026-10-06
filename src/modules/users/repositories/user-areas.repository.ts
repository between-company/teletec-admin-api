import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  EntityManager,
  In,
  Repository
} from 'typeorm'

import { UserArea } from '../entities/user-area.entity.js'

@Injectable()
export class UserAreasRepository {
  constructor(
    @InjectRepository(UserArea)
    private readonly repository: Repository<UserArea>
  ) {}

  findByUserId(
    userId: string,
    manager?: EntityManager
  ): Promise<UserArea[]> {
    return this.getRepository(manager).find({
      where: {
        userId
      },
      relations: {
        area: true
      }
    })
  }

  createMany(
    userId: string,
    areaIds: string[],
    manager?: EntityManager
  ): UserArea[] {
    const repository = this.getRepository(manager)

    return repository.create(
      areaIds.map((areaId) => ({
        userId,
        areaId
      }))
    )
  }

  saveMany(
    userAreas: UserArea[],
    manager?: EntityManager
  ): Promise<UserArea[]> {
    return this.getRepository(manager).save(userAreas)
  }

  deleteByUserId(
    userId: string,
    manager?: EntityManager
  ) {
    return this.getRepository(manager).delete({
      userId
    })
  }

  deleteByUserIdAndAreaIds(
    userId: string,
    areaIds: string[],
    manager?: EntityManager
  ) {
    return this.getRepository(manager).delete({
      userId,
      areaId: In(areaIds)
    })
  }

  private getRepository(
    manager?: EntityManager
  ): Repository<UserArea> {
    return manager
      ? manager.getRepository(UserArea)
      : this.repository
  }
}