import {
  HttpStatus,
  Injectable,
  Logger
} from '@nestjs/common'

import {
  ConfigService
} from '@nestjs/config'

import {
  createHash,
  randomBytes
} from 'node:crypto'

import {
  DataSource,
  type EntityManager
} from 'typeorm'

import * as argon2 from 'argon2'

import {
  ERROR_CODES
} from '../../common/http/constants/error-codes.js'

import {
  errorMessage
} from '../../common/http/messages/error-message.catalog.js'

import {
  ApiException
} from '../../common/http/exceptions/api.exception.js'

import {
  AuditService
} from '../audit/audit.service.js'

import {
  AuditAction
} from '../audit/enums/audit-action.enum.js'

import {
  AuditEntityType
} from '../audit/enums/audit-entity-type.enum.js'

import {
  EmailService
} from '../email/email.service.js'

import {
  UsersService
} from '../users/users.service.js'

import {
  createPaginationMeta,
  paginated
} from '../../common/http/helpers/api-response.helper.js'

import {
  AcceptInvitationDto
} from './dto/accept-invitation.dto.js'

import {
  AcceptInvitationResponseDto
} from './dto/accept-invitation-response.dto.js'

import {
  CreateInvitationDto
} from './dto/create-invitation.dto.js'

import {
  InvitationDetailResponseDto
} from './dto/invitation-detail-response.dto.js'

import {
  InvitationResponseDto
} from './dto/invitation-response.dto.js'

import {
  ListInvitationsQueryDto
} from './dto/list-invitations-query.dto.js'

import {
  Invitation
} from './entities/invitation.entity.js'

import {
  InvitationsRepository
} from './repositories/invitations.repository.js'
import { ResendInvitationResponseDto } from './dto/resend-invitation-response.dto.js'
import { RevokeInvitationResponseDto } from './dto/revoke-invitation-response.dto.js'

interface CreateInvitationResult {
  invitation: Invitation
  token: string
}

@Injectable()
export class InvitationsService {
  private readonly logger =
    new Logger(
      InvitationsService.name
    )

  constructor(
    private readonly invitationsRepository:
      InvitationsRepository,

    private readonly usersService:
      UsersService,

    private readonly auditService:
      AuditService,

    private readonly emailService:
      EmailService,

    private readonly dataSource:
      DataSource,

    private readonly configService:
      ConfigService
  ) {}

  async findAll(
    filters: ListInvitationsQueryDto
  ) {
    const {
      items,
      totalItems
    } = await this.invitationsRepository.findAll({
      status: filters.status,
      search: filters.search,
      userId: filters.userId,
      page: filters.page,
      limit: filters.limit
    })

    return paginated(
      items.map((invitation) =>
        this.toDetail(invitation)
      ),
      createPaginationMeta({
        page: filters.page,
        limit: filters.limit,
        totalItems
      })
    )
  }

  async findById(
    id: string
  ): Promise<InvitationDetailResponseDto> {
    const invitation =
      await this.invitationsRepository.findDetailById(id)

    if (!invitation) {
      throw new ApiException({
        statusCode: HttpStatus.NOT_FOUND,
        code: ERROR_CODES.INVITATION_NOT_FOUND,
        message: errorMessage(ERROR_CODES.INVITATION_NOT_FOUND)
      })
    }

    return this.toDetail(invitation)
  }

  async inviteUser(
    dto: CreateInvitationDto,
    createdById: string | null = null
  ): Promise<InvitationResponseDto> {
    const result =
      await this.dataSource.transaction(
        async manager => {
          const user =
            await this.usersService
              .createPending(
                {
                  email:
                    dto.email,

                  firstName:
                    dto.firstName,

                  lastName:
                    dto.lastName,

                  phoneCountryCode:
                    dto.phoneCountryCode,

                  phone:
                    dto.phone,

                  areaIds:
                    dto.areaIds
                },
                manager
              )

          const {
            invitation,
            token
          } = await this.create(
            user.id,
            createdById,
            manager
          )

          await this.auditService.create(
            {
              action:
                AuditAction.INVITATION_CREATED,

              entityType:
                AuditEntityType.INVITATION,

              entityId:
                invitation.id,

              targetSnapshot: {
                id:
                  invitation.id,

                email:
                  user.email,

                userId:
                  user.id
              },

              after: {
                userId:
                  user.id,

                email:
                  user.email,

                expiresAt:
                  invitation.expiresAt
              }
            },
            manager
          )

          return {
            user,
            invitation,
            token
          }
        }
      )

    let emailSent = false

    try {
      const invitationUrl =
        this.buildInvitationUrl(
          result.token
        )

      await this.emailService
        .sendInvitation({
          to:
            result.user.email,

          firstName:
            result.user.firstName,

          invitationUrl
        })

      emailSent = true
    } catch (error) {
      this.logger.error(
        `Invitation ${result.invitation.id} was created but email delivery failed`,
        error instanceof Error
          ? error.stack
          : undefined
      )
    }

    return {
      id:
        result.invitation.id,

      user:
        result.user,

      expiresAt:
        result.invitation.expiresAt,

      emailSent
    }
  }

  async acceptInvitation(
    dto: AcceptInvitationDto
  ): Promise<AcceptInvitationResponseDto> {
    if (dto.password !== dto.passwordConfirmation) {
      throw new ApiException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.PASSWORD_CONFIRMATION_MISMATCH,
        message: errorMessage(ERROR_CODES.PASSWORD_CONFIRMATION_MISMATCH)
      })
    }
  
    const tokenHash = this.hashToken(dto.token)
  
    const initialInvitation =
      await this.invitationsRepository.findByTokenHash(
        tokenHash
      )
  
    this.validateInvitation(initialInvitation)
  
    const passwordHash = await argon2.hash(
      dto.password,
      {
        type: argon2.argon2id
      }
    )
  
    return this.dataSource.transaction(
      async manager => {
        const invitation =
          await this.invitationsRepository.findByTokenHashForUpdate(
            tokenHash,
            manager
          )
  
        this.validateInvitation(invitation)
  
        const now = new Date()
  
        await this.usersService.activatePendingUser(
          invitation.userId,
          passwordHash,
          now,
          manager
        )
  
        invitation.usedAt = now
  
        await this.invitationsRepository.save(
          invitation,
          manager
        )
  
        await this.auditService.create(
          {
            action: AuditAction.INVITATION_ACCEPTED,
            entityType: AuditEntityType.INVITATION,
            entityId: invitation.id,
            targetSnapshot: {
              id: invitation.id,
              userId: invitation.userId
            },
            before: {
              usedAt: null
            },
            after: {
              usedAt: now
            }
          },
          manager
        )
  
        return {
          userId: invitation.userId,
          invitationId: invitation.id,
          isActive: true,
          activatedAt: now
        }
      }
    )
  }

  async resendInvitation(
    invitationId: string,
    createdById: string | null = null
  ): Promise<ResendInvitationResponseDto> {
    const result = await this.dataSource.transaction(
      async manager => {
        const invitation =
          await this.invitationsRepository.findByIdForUpdate(
            invitationId,
            manager
          )
  
        if (!invitation) {
          throw new ApiException({
            statusCode: HttpStatus.NOT_FOUND,
            code: ERROR_CODES.INVITATION_NOT_FOUND,
            message: errorMessage(ERROR_CODES.INVITATION_NOT_FOUND)
          })
        }
  
        if (invitation.usedAt) {
          throw new ApiException({
            statusCode: HttpStatus.CONFLICT,
            code: ERROR_CODES.INVITATION_ALREADY_USED,
            message: errorMessage(ERROR_CODES.INVITATION_ALREADY_USED)
          })
        }
  
        const invitationWithUser =
          await this.invitationsRepository.findByIdWithUser(
            invitation.id,
            manager
          )
  
        if (!invitationWithUser?.user) {
          throw new ApiException({
            statusCode: HttpStatus.NOT_FOUND,
            code: ERROR_CODES.USER_NOT_FOUND,
            message: errorMessage(ERROR_CODES.USER_NOT_FOUND)
          })
        }
  
        if (
          invitationWithUser.user.isActive ||
          invitationWithUser.user.activatedAt
        ) {
          throw new ApiException({
            statusCode: HttpStatus.CONFLICT,
            code: ERROR_CODES.USER_ALREADY_ACTIVATED,
            message: errorMessage(ERROR_CODES.USER_ALREADY_ACTIVATED)
          })
        }
  
        let revokedAt = invitation.revokedAt
  
        if (!revokedAt) {
          revokedAt = new Date()
          invitation.revokedAt = revokedAt
  
          await this.invitationsRepository.save(
            invitation,
            manager
          )
        }
  
        const {
          invitation: newInvitation,
          token
        } = await this.create(
          invitation.userId,
          createdById,
          manager
        )
  
        await this.auditService.create(
          {
            action: AuditAction.INVITATION_RESENT,
            entityType: AuditEntityType.INVITATION,
            entityId: newInvitation.id,
            targetSnapshot: {
              id: newInvitation.id,
              userId: invitation.userId,
              email: invitationWithUser.user.email
            },
            after: {
              previousInvitationId: invitation.id,
              previousInvitationRevokedAt: revokedAt,
              expiresAt: newInvitation.expiresAt
            },
            metadata: {
              previousInvitationId: invitation.id
            }
          },
          manager
        )
  
        return {
          previousInvitationId: invitation.id,
          invitation: newInvitation,
          token,
          email: invitationWithUser.user.email,
          firstName: invitationWithUser.user.firstName
        }
      }
    )
  
    let emailSent = false
  
    try {
      const invitationUrl = this.buildInvitationUrl(
        result.token
      )
  
      await this.emailService.sendInvitation({
        to: result.email,
        firstName: result.firstName,
        invitationUrl
      })
  
      emailSent = true
    } catch (error) {
      this.logger.error(
        `Invitation ${result.invitation.id} was created but email delivery failed`,
        error instanceof Error
          ? error.stack
          : undefined
      )
    }
  
    return {
      previousInvitationId: result.previousInvitationId,
      invitationId: result.invitation.id,
      expiresAt: result.invitation.expiresAt,
      emailSent
    }
  }

  async create(
    userId: string,
    createdById: string | null,
    manager?: EntityManager
  ): Promise<CreateInvitationResult> {
    const token =
      randomBytes(32)
        .toString('hex')

    const tokenHash =
      this.hashToken(token)

    const expiresAt =
      new Date(
        Date.now() +
        24 * 60 * 60 * 1000
      )

    const invitation =
      this.invitationsRepository.create(
        {
          userId,
          tokenHash,
          expiresAt,
          usedAt:
            null,
          revokedAt:
            null,
          createdById
        },
        manager
      )

    const savedInvitation =
      await this.invitationsRepository
        .save(
          invitation,
          manager
        )

    return {
      invitation:
        savedInvitation,

      token
    }
  }

  async revokeInvitation(
    invitationId: string
  ): Promise<RevokeInvitationResponseDto> {
    return this.dataSource.transaction(
      async manager => {
        const invitation =
          await this.invitationsRepository.findByIdForUpdate(
            invitationId,
            manager
          )
  
        if (!invitation) {
          throw new ApiException({
            statusCode: HttpStatus.NOT_FOUND,
            code: ERROR_CODES.INVITATION_NOT_FOUND,
            message: errorMessage(ERROR_CODES.INVITATION_NOT_FOUND)
          })
        }
  
        if (invitation.usedAt) {
          throw new ApiException({
            statusCode: HttpStatus.CONFLICT,
            code: ERROR_CODES.INVITATION_ALREADY_USED,
            message: errorMessage(ERROR_CODES.INVITATION_ALREADY_USED)
          })
        }
  
        if (invitation.revokedAt) {
          throw new ApiException({
            statusCode: HttpStatus.CONFLICT,
            code: ERROR_CODES.INVITATION_REVOKED,
            message: errorMessage(ERROR_CODES.INVITATION_REVOKED)
          })
        }
  
        const revokedAt = new Date()
  
        invitation.revokedAt = revokedAt
  
        await this.invitationsRepository.save(
          invitation,
          manager
        )
  
        await this.auditService.create(
          {
            action: AuditAction.INVITATION_REVOKED,
            entityType: AuditEntityType.INVITATION,
            entityId: invitation.id,
            targetSnapshot: {
              id: invitation.id,
              userId: invitation.userId
            },
            before: {
              revokedAt: null
            },
            after: {
              revokedAt
            }
          },
          manager
        )
  
        return {
          invitationId: invitation.id,
          revokedAt
        }
      }
    )
  }

  private toDetail(
    invitation: Invitation
  ): InvitationDetailResponseDto {
    return {
      id: invitation.id,
      expiresAt: invitation.expiresAt,
      usedAt: invitation.usedAt,
      revokedAt: invitation.revokedAt,
      user: this.usersService.toResponse(
        invitation.user
      ),
      createdAt: invitation.createdAt,
      updatedAt: invitation.updatedAt
    }
  }

  private validateInvitation(
    invitation: Invitation | null
  ): asserts invitation is Invitation {
    if (!invitation) {
      throw new ApiException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.INVITATION_INVALID_TOKEN,
        message: errorMessage(ERROR_CODES.INVITATION_INVALID_TOKEN)
      })
    }
  
    if (invitation.usedAt) {
      throw new ApiException({
        statusCode: HttpStatus.CONFLICT,
        code: ERROR_CODES.INVITATION_ALREADY_USED,
        message: errorMessage(ERROR_CODES.INVITATION_ALREADY_USED)
      })
    }
  
    if (invitation.revokedAt) {
      throw new ApiException({
        statusCode: HttpStatus.GONE,
        code: ERROR_CODES.INVITATION_REVOKED,
        message: errorMessage(ERROR_CODES.INVITATION_REVOKED)
      })
    }
  
    if (invitation.expiresAt.getTime() <= Date.now()) {
      throw new ApiException({
        statusCode: HttpStatus.GONE,
        code: ERROR_CODES.INVITATION_EXPIRED,
        message: errorMessage(ERROR_CODES.INVITATION_EXPIRED)
      })
    }
  }

  hashToken(
    token: string
  ): string {
    return createHash('sha256')
      .update(token)
      .digest('hex')
  }

  private buildInvitationUrl(
    token: string
  ): string {
    const frontendUrl = this.configService
      .getOrThrow<string>('FRONTEND_URL')
      .replace(/\/$/, '')
  
    return `${frontendUrl}/accept-invitation#token=${encodeURIComponent(token)}`
  }
}