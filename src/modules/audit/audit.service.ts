import { Injectable } from '@nestjs/common'
import type { EntityManager } from 'typeorm'

import { RequestContextService } from '../../common/context/request-context.service.js'
import type { AuditLog } from './entities/audit-log.entity.js'
import type { CreateAuditLogData } from './interfaces/create-audit-log.interface.js'
import { AuditRepository } from './repositories/audit.repository.js'

@Injectable()
export class AuditService {
  constructor(
    private readonly auditRepository: AuditRepository,
    private readonly requestContextService: RequestContextService
  ) {}

  create(
    data: CreateAuditLogData,
    manager?: EntityManager
  ): Promise<AuditLog> {
    const context = this.requestContextService.get()

    return this.auditRepository.create(
      {
        ...data,

        actorUserId:
          data.actorUserId !== undefined
            ? data.actorUserId
            : context?.actorUserId ?? null,

        actorSessionId:
          data.actorSessionId !== undefined
            ? data.actorSessionId
            : context?.actorSessionId ?? null,

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
}