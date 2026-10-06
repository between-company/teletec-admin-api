import { Injectable } from '@nestjs/common'
import { AsyncLocalStorage } from 'node:async_hooks'

import type { RequestContext } from './request-context.interface.js'

@Injectable()
export class RequestContextService {
  private readonly storage =
    new AsyncLocalStorage<RequestContext>()

  run(
    context: RequestContext,
    callback: () => void
  ): void {
    this.storage.run(context, callback)
  }

  get(): RequestContext | undefined {
    return this.storage.getStore()
  }

  setActor(
    actorUserId: string,
    actorSessionId: string
  ): void {
    const context = this.storage.getStore()

    if (!context) {
      return
    }

    context.actorUserId = actorUserId
    context.actorSessionId = actorSessionId
  }
}