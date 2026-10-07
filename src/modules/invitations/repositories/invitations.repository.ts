import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  DeepPartial,
  EntityManager,
  IsNull,
  MoreThan,
  Repository
} from 'typeorm'

import { Invitation } from '../entities/invitation.entity.js'

@Injectable()
export class InvitationsRepository {
  constructor(
    @InjectRepository(Invitation)
    private readonly repository: Repository<Invitation>
  ) {}

  create(
    data: DeepPartial<Invitation>,
    manager?: EntityManager
  ): Invitation {
    return this.getRepository(manager).create(data)
  }

  save(
    invitation: Invitation,
    manager?: EntityManager
  ): Promise<Invitation> {
    return this.getRepository(manager).save(invitation)
  }

  findByTokenHash(
    tokenHash: string,
    manager?: EntityManager
  ): Promise<Invitation | null> {
    return this.getRepository(manager).findOne({
      where: {
        tokenHash
      }
    })
  }

  findByTokenHashForUpdate(
    tokenHash: string,
    manager: EntityManager
  ): Promise<Invitation | null> {
    return manager.getRepository(Invitation).findOne({
      where: {
        tokenHash
      },
      lock: {
        mode: 'pessimistic_write'
      }
    })
  }

  findByIdForUpdate(
    id: string,
    manager: EntityManager
  ): Promise<Invitation | null> {
    return manager.getRepository(Invitation).findOne({
      where: {
        id
      },
      lock: {
        mode: 'pessimistic_write'
      }
    })
  }

  findByIdWithUser(
    id: string,
    manager?: EntityManager
  ): Promise<Invitation | null> {
    return this.getRepository(manager).findOne({
      where: {
        id
      },
      relations: {
        user: true
      }
    })
  }

  findActiveByUserId(
    userId: string,
    manager?: EntityManager
  ): Promise<Invitation | null> {
    return this.getRepository(manager).findOne({
      where: {
        userId,
        usedAt: IsNull(),
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date())
      },
      order: {
        createdAt: 'DESC'
      }
    })
  }

  private getRepository(
    manager?: EntityManager
  ): Repository<Invitation> {
    return manager
      ? manager.getRepository(Invitation)
      : this.repository
  }
}