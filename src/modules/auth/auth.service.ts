import {
    HttpStatus,
    Injectable
  } from '@nestjs/common'
  import { ConfigService } from '@nestjs/config'
  import { JwtService } from '@nestjs/jwt'
  import {
    createHash,
    randomBytes
  } from 'node:crypto'
  import * as argon2 from 'argon2'
  import { DataSource } from 'typeorm'
  
  import { ERROR_CODES } from '../../common/http/constants/error-codes.js'
  import { ApiException } from '../../common/http/exceptions/api.exception.js'
  import { RequestContextService } from '../../common/context/request-context.service.js'
  
  import { AuditService } from '../audit/audit.service.js'
  import { AuditAction } from '../audit/enums/audit-action.enum.js'
  import { AuditEntityType } from '../audit/enums/audit-entity-type.enum.js'
  import { UsersService } from '../users/users.service.js'
  
  import type { AccessTokenPayload } from './interfaces/access-token-payload.interface.js'
  import type { LoginResult } from './interfaces/login-result.interface.js'
  import { SessionsRepository } from './repositories/sessions.repository.js'
import { RefreshResult } from './interfaces/refresh-result.interface.js'
  
  @Injectable()
  export class AuthService {
    constructor(
      private readonly usersService: UsersService,
      private readonly sessionsRepository: SessionsRepository,
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
      private readonly auditService: AuditService,
      private readonly requestContextService: RequestContextService,
      private readonly dataSource: DataSource
    ) {}
  
    async login(
      email: string,
      password: string
    ): Promise<LoginResult> {
      const user = await this.usersService.findForAuthentication(
        email
      )
  
      if (
        !user ||
        !user.isActive ||
        !user.passwordHash ||
        !user.activatedAt
      ) {
        throw this.invalidCredentialsException()
      }
  
      const passwordMatches = await argon2.verify(
        user.passwordHash,
        password
      )
  
      if (!passwordMatches) {
        throw this.invalidCredentialsException()
      }
  
      const refreshToken = this.generateRefreshToken()
      const refreshTokenHash = this.hashRefreshToken(
        refreshToken
      )
  
      const sessionExpiresDays =
        this.configService.getOrThrow<number>(
          'SESSION_EXPIRES_DAYS'
        )
  
      const expiresAt = new Date(
        Date.now() +
        sessionExpiresDays * 24 * 60 * 60 * 1000
      )
  
      const session = await this.dataSource.transaction(
        async manager => {
          const newSession =
            this.sessionsRepository.create(
              {
                userId: user.id,
                refreshTokenHash,
                expiresAt
              },
              manager
            )
  
          const savedSession =
            await this.sessionsRepository.save(
              newSession,
              manager
            )
  
          this.requestContextService.setActor(
            user.id,
            savedSession.id
          )
  
          await this.auditService.create(
            {
              action: AuditAction.SESSION_CREATED,
              entityType: AuditEntityType.SESSION,
              entityId: savedSession.id,
              targetSnapshot: {
                id: savedSession.id,
                userId: user.id,
                email: user.email
              },
              after: {
                userId: user.id,
                expiresAt: savedSession.expiresAt
              }
            },
            manager
          )
  
          return savedSession
        }
      )
  
      const accessTokenExpiresIn =
        this.getAccessTokenExpiresInSeconds()
  
      const payload: AccessTokenPayload = {
        sub: user.id,
        sid: session.id
      }
  
      const accessToken = await this.jwtService.signAsync(
        payload,
        {
          expiresIn: accessTokenExpiresIn
        }
      )
  
      return {
        accessToken,
        refreshToken,
        expiresIn: accessTokenExpiresIn,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      }
    }

    async refresh(
      refreshToken: string
    ): Promise<RefreshResult> {
      const currentRefreshTokenHash = this.hashRefreshToken(
        refreshToken
      )
    
      return this.dataSource.transaction(
        async manager => {
          const session =
            await this.sessionsRepository.findByRefreshTokenHashForUpdate(
              currentRefreshTokenHash,
              manager
            )
    
          if (!session) {
            throw this.invalidSessionException()
          }
    
          if (session.revokedAt) {
            throw this.invalidSessionException()
          }
    
          if (session.expiresAt.getTime() <= Date.now()) {
            throw this.invalidSessionException()
          }
    
          const newRefreshToken = this.generateRefreshToken()
          const newRefreshTokenHash = this.hashRefreshToken(
            newRefreshToken
          )
    
          session.refreshTokenHash = newRefreshTokenHash
          session.lastSeenAt = new Date()
    
          await this.sessionsRepository.save(
            session,
            manager
          )
    
          this.requestContextService.setActor(
            session.userId,
            session.id
          )
    
          await this.auditService.create(
            {
              action: AuditAction.SESSION_REFRESHED,
              entityType: AuditEntityType.SESSION,
              entityId: session.id,
              targetSnapshot: {
                id: session.id,
                userId: session.userId
              },
              after: {
                lastSeenAt: session.lastSeenAt
              }
            },
            manager
          )
    
          const expiresIn = this.getAccessTokenExpiresInSeconds()
    
          const payload: AccessTokenPayload = {
            sub: session.userId,
            sid: session.id
          }
    
          const accessToken = await this.jwtService.signAsync(
            payload,
            {
              expiresIn
            }
          )
    
          return {
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn
          }
        }
      )
    }
  
    private generateRefreshToken(): string {
      return randomBytes(64).toString('hex')
    }
  
    private hashRefreshToken(
      refreshToken: string
    ): string {
      return createHash('sha256')
        .update(refreshToken)
        .digest('hex')
    }
  
    private getAccessTokenExpiresInSeconds(): number {
      const value =
        this.configService.getOrThrow<string>(
          'JWT_ACCESS_EXPIRES_IN'
        )
  
      const match = value.match(
        /^(\d+)(s|m|h|d)$/
      )
  
      if (!match) {
        throw new Error(
          'JWT_ACCESS_EXPIRES_IN must use formats such as 30s, 15m, 1h or 1d'
        )
      }
  
      const amount = Number(match[1])
      const unit = match[2]
  
      const multipliers: Record<string, number> = {
        s: 1,
        m: 60,
        h: 60 * 60,
        d: 24 * 60 * 60
      }
  
      return amount * multipliers[unit]
    }
  
    private invalidCredentialsException(): ApiException {
      return new ApiException({
        statusCode: HttpStatus.UNAUTHORIZED,
        code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        message: 'Invalid email or password'
      })
    }

    private invalidSessionException(): ApiException {
      return new ApiException({
        statusCode: HttpStatus.UNAUTHORIZED,
        code: ERROR_CODES.AUTH_INVALID_SESSION,
        message: 'Invalid or expired session'
      })
    }
  }