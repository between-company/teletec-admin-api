import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  EntityManager,
  IsNull,
  MoreThan,
  Repository
} from 'typeorm'

import { Session } from '../../sessions/entities/session.entity.js'

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectRepository(Session)
    private readonly repository: Repository<Session>
  ) {}

  create(
    data: Partial<Session>,
    manager?: EntityManager
  ): Session {
    return this.getRepository(manager).create(data)
  }

  save(
    session: Session,
    manager?: EntityManager
  ): Promise<Session> {
    return this.getRepository(manager).save(session)
  }

  findById(
    id: string,
    manager?: EntityManager
  ): Promise<Session | null> {
    return this.getRepository(manager).findOne({
      where: {
        id
      }
    })
  }

  findActiveById(
    id: string,
    manager?: EntityManager
  ): Promise<Session | null> {
    return this.getRepository(manager).findOne({
      where: {
        id,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date())
      }
    })
  }

  findByRefreshTokenHash(
    refreshTokenHash: string,
    manager?: EntityManager
  ): Promise<Session | null> {
    return this.getRepository(manager).findOne({
      where: {
        refreshTokenHash
      }
    })
  }

  findActiveByRefreshTokenHash(
    refreshTokenHash: string,
    manager?: EntityManager
  ): Promise<Session | null> {
    return this.getRepository(manager).findOne({
      where: {
        refreshTokenHash,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date())
      }
    })
  }

  findActiveByUserId(
    userId: string,
    manager?: EntityManager
  ): Promise<Session[]> {
    return this.getRepository(manager).find({
      where: {
        userId,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date())
      },
      order: {
        createdAt: 'DESC'
      }
    })
  }

  findByRefreshTokenHashForUpdate(
    refreshTokenHash: string,
    manager: EntityManager
  ): Promise<Session | null> {
    return manager.getRepository(Session).findOne({
      where: {
        refreshTokenHash
      },
      lock: {
        mode: 'pessimistic_write'
      }
    })
  }

  private getRepository(
    manager?: EntityManager
  ): Repository<Session> {
    return manager
      ? manager.getRepository(Session)
      : this.repository
  }
}