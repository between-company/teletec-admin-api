export interface RequestContext {
    requestId: string
    ipAddress: string | null
    userAgent: string | null
  
    actorUserId?: string | null
    actorSessionId?: string | null
}