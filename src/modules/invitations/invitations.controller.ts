import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags
} from '@nestjs/swagger'

import {
  API_VERSION
} from '../../common/constants/api-version.constants.js'

import {
  ERROR_CODES
} from '../../common/http/constants/error-codes.js'

import {
  errorMessage
} from '../../common/http/messages/error-message.catalog.js'

import {
  ApiErrorResponse
} from '../../common/swagger/decorators/api-error-response.decorator.js'

import {
  ApiPaginatedResponse
} from '../../common/swagger/decorators/api-paginated-response.decorator.js'

import {
  ApiSuccessResponse
} from '../../common/swagger/decorators/api-success-response.decorator.js'

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
  InvitationsService
} from './invitations.service.js'
import { ResendInvitationResponseDto } from './dto/resend-invitation-response.dto.js'
import { RevokeInvitationResponseDto } from './dto/revoke-invitation-response.dto.js'
import { ValidateInvitationDto } from './dto/validate-invitation.dto.js'
import { ValidateInvitationResponseDto } from './dto/validate-invitation-response.dto.js'
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js'
import { PERMISSIONS } from '../access/constants/access.constants.js'
import { RequirePermissions } from '../access/decorators/require-permissions.decorator.js'
import { PermissionsGuard } from '../access/guards/permissions.guard.js'
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.js'

@ApiTags('Invitations')
@Controller({
  path: 'invitations',
  version: API_VERSION.V1
})
export class InvitationsController {
  constructor(
    private readonly invitationsService:
      InvitationsService
  ) {}

  @Get()
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @RequirePermissions(PERMISSIONS.USERS_INVITE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List invitations'
  })
  @ApiPaginatedResponse(InvitationDetailResponseDto)
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    code: ERROR_CODES.VALIDATION_ERROR,
    message: 'Validation failed'
  })
  findAll(
    @Query() query: ListInvitationsQueryDto,
  ) {
    return this.invitationsService.findAll(query)
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @RequirePermissions(PERMISSIONS.USERS_INVITE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get invitation by ID'
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Invitation ID'
  })
  @ApiSuccessResponse(InvitationDetailResponseDto)
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    code: ERROR_CODES.INVITATION_NOT_FOUND,
    message: errorMessage(ERROR_CODES.INVITATION_NOT_FOUND)
  })
  findById(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.invitationsService.findById(id)
  }

  @Post()
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @RequirePermissions(PERMISSIONS.USERS_INVITE)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Invite a new user'
  })
  @ApiSuccessResponse(
    InvitationResponseDto,
    {
      status:
        HttpStatus.CREATED
    }
  )
  @ApiErrorResponse({
    status:
      HttpStatus.BAD_REQUEST,
    code:
      ERROR_CODES.USER_INVALID_AREAS,
    message:
      errorMessage(ERROR_CODES.USER_INVALID_AREAS)
  })
  @ApiErrorResponse({
    status:
      HttpStatus.CONFLICT,
    code:
      ERROR_CODES
        .USER_EMAIL_ALREADY_EXISTS,
    message:
      errorMessage(ERROR_CODES.USER_EMAIL_ALREADY_EXISTS)
  })
  async create(
    @Body() dto: CreateInvitationDto,
    @Req() request: AuthenticatedRequest
  ): Promise<InvitationResponseDto> {
    return this.invitationsService
      .inviteUser(
        dto,
        request.auth.userId,
      )
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary: 'Validate an invitation before showing the password form',
    description: 'Public endpoint. Does not consume the invitation or activate the user.'
  })
  @ApiSuccessResponse(ValidateInvitationResponseDto)
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    code: ERROR_CODES.VALIDATION_ERROR,
    message: 'Validation failed'
  })
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    code: ERROR_CODES.INVITATION_INVALID_TOKEN,
    message: errorMessage(ERROR_CODES.INVITATION_INVALID_TOKEN)
  })
  @ApiErrorResponse({
    status: HttpStatus.CONFLICT,
    code: ERROR_CODES.INVITATION_ALREADY_USED,
    message: errorMessage(ERROR_CODES.INVITATION_ALREADY_USED)
  })
  @ApiErrorResponse({
    status: HttpStatus.GONE,
    code: ERROR_CODES.INVITATION_REVOKED,
    message: errorMessage(ERROR_CODES.INVITATION_REVOKED)
  })
  @ApiErrorResponse({
    status: HttpStatus.GONE,
    code: ERROR_CODES.INVITATION_EXPIRED,
    message: errorMessage(ERROR_CODES.INVITATION_EXPIRED)
  })
  validate(
    @Body() dto: ValidateInvitationDto
  ): Promise<ValidateInvitationResponseDto> {
    return this.invitationsService.validateInvitationToken(dto)
  }

  @Post('accept')
  @ApiOperation({
    summary:
      'Accept an invitation and activate the user account'
  })
  @ApiSuccessResponse(
    AcceptInvitationResponseDto,
    {
      status:
        HttpStatus.CREATED
    }
  )
  @ApiErrorResponse({
    status:
      HttpStatus.BAD_REQUEST,
    code:
      ERROR_CODES
        .INVITATION_INVALID_TOKEN,
    message:
      errorMessage(ERROR_CODES.INVITATION_INVALID_TOKEN)
  })
  @ApiErrorResponse({
    status:
      HttpStatus.CONFLICT,
    code:
      ERROR_CODES
        .INVITATION_ALREADY_USED,
    message:
      errorMessage(ERROR_CODES.INVITATION_ALREADY_USED)
  })
  @ApiErrorResponse({
    status:
      HttpStatus.GONE,
    code:
      ERROR_CODES
        .INVITATION_EXPIRED,
    message:
      errorMessage(ERROR_CODES.INVITATION_EXPIRED)
  })
  @ApiErrorResponse({
    status: HttpStatus.GONE,
    code: ERROR_CODES.INVITATION_REVOKED,
    message: errorMessage(ERROR_CODES.INVITATION_REVOKED)
  })
  async accept(
    @Body()
    dto: AcceptInvitationDto
  ): Promise<AcceptInvitationResponseDto> {
    return this.invitationsService
      .acceptInvitation(dto)
  }

  @Post(':id/resend')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @RequirePermissions(PERMISSIONS.USERS_INVITE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Issue a new invitation for the same pending user'
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Invitation ID'
  })
  @ApiSuccessResponse(
    ResendInvitationResponseDto,
    {
      status: HttpStatus.OK
    }
  )
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    code: ERROR_CODES.INVITATION_NOT_FOUND,
    message: errorMessage(ERROR_CODES.INVITATION_NOT_FOUND),
    examples: [
      {
        code: ERROR_CODES.INVITATION_NOT_FOUND,
        message: errorMessage(ERROR_CODES.INVITATION_NOT_FOUND)
      },
      {
        code: ERROR_CODES.USER_NOT_FOUND,
        message: errorMessage(ERROR_CODES.USER_NOT_FOUND)
      }
    ]
  })
  @ApiErrorResponse({
    status: HttpStatus.CONFLICT,
    code: ERROR_CODES.INVITATION_ALREADY_USED,
    message: errorMessage(ERROR_CODES.INVITATION_ALREADY_USED),
    examples: [
      {
        code: ERROR_CODES.INVITATION_ALREADY_USED,
        message: errorMessage(ERROR_CODES.INVITATION_ALREADY_USED)
      },
      {
        code: ERROR_CODES.USER_ALREADY_ACTIVATED,
        message: errorMessage(ERROR_CODES.USER_ALREADY_ACTIVATED)
      }
    ]
  })
  async resend(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest
  ): Promise<ResendInvitationResponseDto> {
    return this.invitationsService.resendInvitation(
      id,
      request.auth.userId,
    )
  }

  @Post(':id/revoke') 
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @RequirePermissions(PERMISSIONS.USERS_INVITE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Revoke a pending invitation'
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Invitation ID'
  })
  @ApiSuccessResponse(
    RevokeInvitationResponseDto,
    {
      status: HttpStatus.OK
    }
  )
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    code: ERROR_CODES.INVITATION_NOT_FOUND,
    message: errorMessage(ERROR_CODES.INVITATION_NOT_FOUND)
  })
  @ApiErrorResponse({
    status: HttpStatus.CONFLICT,
    code: ERROR_CODES.INVITATION_ALREADY_USED,
    message: errorMessage(ERROR_CODES.INVITATION_ALREADY_USED)
  })
  @ApiErrorResponse({
    status: HttpStatus.CONFLICT,
    code: ERROR_CODES.INVITATION_REVOKED,
    message: errorMessage(ERROR_CODES.INVITATION_REVOKED)
  })
  async revoke(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest
  ): Promise<RevokeInvitationResponseDto> {
    return this.invitationsService.revokeInvitation(
      id,
      request.auth.userId
    )
  }
}