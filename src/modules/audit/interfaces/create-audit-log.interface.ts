import { AuditAction } from '../enums/audit-action.enum.js'
import { AuditEntityType } from '../enums/audit-entity-type.enum.js'

export interface CreateAuditLogData {
  actorUserId?: string | null
  actorSessionId?: string | null

  action: AuditAction

  entityType: AuditEntityType
  entityId?: string | null

  actorSnapshot?: Record<string, unknown> | null
  targetSnapshot?: Record<string, unknown> | null

  before?: Record<string, unknown> | null
  after?: Record<string, unknown> | null
  metadata?: Record<string, unknown> | null

  ipAddress?: string | null
  userAgent?: string | null
  requestId?: string | null
}