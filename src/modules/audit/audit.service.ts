import { Injectable } from '@nestjs/common'
import {
  DataSource,
  type EntityManager
} from 'typeorm'

import { RequestContextService } from '../../common/context/request-context.service.js'
import { User } from '../users/entities/user.entity.js'
import type { AuditLog } from './entities/audit-log.entity.js'
import type { CreateAuditLogData } from './interfaces/create-audit-log.interface.js'
import { AuditRepository } from './repositories/audit.repository.js'

@Injectable()
export class AuditService {
  constructor(
    private readonly auditRepository: AuditRepository,
    private readonly requestContextService: RequestContextService,
    private readonly dataSource: DataSource
  ) {}

  async create(
    data: CreateAuditLogData,
    manager?: EntityManager
  ): Promise<AuditLog> {
    const context = this.requestContextService.get()

    const actorUserId =
      data.actorUserId !== undefined
        ? data.actorUserId
        : context?.actorUserId ?? null

    const actorSessionId =
      data.actorSessionId !== undefined
        ? data.actorSessionId
        : context?.actorSessionId ?? null

    const actorSnapshot =
      data.actorSnapshot !== undefined
        ? data.actorSnapshot
        : await this.findActorSnapshot(
            actorUserId,
            manager
          )

    return this.auditRepository.create(
      {
        ...data,
        actorUserId,
        actorSessionId,
        actorSnapshot,

        ipAddress:
          data.ipAddress !== undefined
            ? data.ipAddress
            : context?.ipAddress ?? null,

        userAgent:
          data.userAgent !== undefined
            ? data.userAgent
            : context?.userAgent ?? null,

        requestId:
          data.requestId !== undefined
            ? data.requestId
            : context?.requestId ?? null
      },
      manager
    )
  }

  private async findActorSnapshot(
    actorUserId: string | null,
    manager?: EntityManager
  ): Promise<Record<string, unknown> | null> {
    if (!actorUserId) {
      return null
    }

    const repository = manager
      ? manager.getRepository(User)
      : this.dataSource.getRepository(User)

    const actor = await repository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName'
      ])
      .where('user.id = :actorUserId', { actorUserId })
      .withDeleted()
      .getOne()

    if (!actor) {
      return null
    }

    return {
      id: actor.id,
      email: actor.email,
      firstName: actor.firstName,
      lastName: actor.lastName
    }
  }
}