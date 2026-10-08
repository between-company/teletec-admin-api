import {
    CanActivate,
    ExecutionContext,
    HttpStatus,
    Injectable
  } from '@nestjs/common'
  import { JwtService } from '@nestjs/jwt'
  import type { Request } from 'express'
  
  import { RequestContextService } from '../../../common/context/request-context.service.js'
  import { ERROR_CODES } from '../../../common/http/constants/error-codes.js'
  import { ApiException } from '../../../common/http/exceptions/api.exception.js'
  import { errorMessage } from '../../../common/http/messages/error-message.catalog.js'
  
  import type { AccessTokenPayload } from '../interfaces/access-token-payload.interface.js'
  import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface.js'
  import { SessionsRepository } from '../repositories/sessions.repository.js'
  
  @Injectable()
  export class AccessTokenGuard implements CanActivate {
    constructor(
      private readonly jwtService: JwtService,
      private readonly sessionsRepository: SessionsRepository,
      private readonly requestContextService: RequestContextService
    ) {}
  
    async canActivate(
      context: ExecutionContext
    ): Promise<boolean> {
      const request = context
        .switchToHttp()
        .getRequest<Request>()
  
      const token = this.extractBearerToken(request)
  
      if (!token) {
        throw new ApiException({
          statusCode: HttpStatus.UNAUTHORIZED,
          code: ERROR_CODES.AUTH_TOKEN_MISSING,
          message: errorMessage(ERROR_CODES.AUTH_TOKEN_MISSING)
        })
      }
  
      let payload: AccessTokenPayload
  
      try {
        payload =
          await this.jwtService.verifyAsync<AccessTokenPayload>(
            token
          )
      } catch {
        throw new ApiException({
          statusCode: HttpStatus.UNAUTHORIZED,
          code: ERROR_CODES.AUTH_INVALID_TOKEN,
          message: errorMessage(ERROR_CODES.AUTH_INVALID_TOKEN)
        })
      }
  
      if (!payload.sub || !payload.sid) {
        throw new ApiException({
          statusCode: HttpStatus.UNAUTHORIZED,
          code: ERROR_CODES.AUTH_INVALID_TOKEN,
          message: errorMessage(ERROR_CODES.AUTH_INVALID_TOKEN)
        })
      }
  
      const session =
        await this.sessionsRepository.findActiveById(
          payload.sid
        )
  
      if (!session) {
        throw new ApiException({
          statusCode: HttpStatus.UNAUTHORIZED,
          code: ERROR_CODES.AUTH_INVALID_SESSION,
          message: errorMessage(ERROR_CODES.AUTH_INVALID_SESSION)
        })
      }
  
      if (session.userId !== payload.sub) {
        throw new ApiException({
          statusCode: HttpStatus.UNAUTHORIZED,
          code: ERROR_CODES.AUTH_INVALID_SESSION,
          message: errorMessage(ERROR_CODES.AUTH_INVALID_SESSION)
        })
      }
  
      this.requestContextService.setActor(
        payload.sub,
        payload.sid
      )
  
      const authenticatedRequest =
        request as AuthenticatedRequest
  
      authenticatedRequest.auth = {
        userId: payload.sub,
        sessionId: payload.sid
      }
  
      return true
    }
  
    private extractBearerToken(
      request: Request
    ): string | null {
      const authorization =
        request.headers.authorization
  
      if (!authorization) {
        return null
      }
  
      const [type, token] =
        authorization.split(' ')
  
      if (
        type !== 'Bearer' ||
        !token
      ) {
        return null
      }
  
      return token
    }
  }