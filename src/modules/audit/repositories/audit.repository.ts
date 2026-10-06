import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  EntityManager,
  Repository
} from 'typeorm'

import { AuditLog } from '../entities/audit-log.entity.js'
import type { CreateAuditLogData } from '../interfaces/create-audit-log.interface.js'

@Injectable()
export class AuditRepository {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repository: Repository<AuditLog>
  ) {}

  async create(
    data: CreateAuditLogData,
    manager?: EntityManager
  ): Promise<AuditLog> {
    const repository = this.getRepository(manager)

    const auditLog = repository.create({
      actorUserId: data.actorUserId ?? null,
      actorSessionId: data.actorSessionId ?? null,

      action: data.action,

      entityType: data.entityType,
      entityId: data.entityId ?? null,

      actorSnapshot: data.actorSnapshot ?? null,
      targetSnapshot: data.targetSnapshot ?? null,

      before: data.before ?? null,
      after: data.after ?? null,
      metadata: data.metadata ?? null,

      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
      requestId: data.requestId ?? null
    })

    return repository.save(auditLog)
  }

  private getRepository(
    manager?: EntityManager
  ): Repository<AuditLog> {
    return manager
      ? manager.getRepository(AuditLog)
      : this.repository
  }
}