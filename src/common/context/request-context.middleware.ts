import { Injectable } from '@nestjs/common'
import type {
  NextFunction,
  Request,
  Response
} from 'express'
import { randomUUID } from 'node:crypto'

import { RequestContextService } from './request-context.service.js'

@Injectable()
export class RequestContextMiddleware {
  constructor(
    private readonly requestContextService: RequestContextService
  ) {}

  use(
    request: Request,
    response: Response,
    next: NextFunction
  ): void {
    const requestId = randomUUID()

    response.setHeader(
      'X-Request-Id',
      requestId
    )

    this.requestContextService.run(
      {
        requestId,
        ipAddress: request.ip ?? null,
        userAgent:
          request.get('user-agent') ?? null
      },
      next
    )
  }
}