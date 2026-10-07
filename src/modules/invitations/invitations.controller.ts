import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query
} from '@nestjs/common'

import {
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
    @Query() query: ListInvitationsQueryDto
  ) {
    return this.invitationsService.findAll(query)
  }

  @Get(':id')
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
    message: 'Invitation not found'
  })
  findById(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.invitationsService.findById(id)
  }

  @Post()
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
      'One or more areas are invalid or inactive'
  })
  @ApiErrorResponse({
    status:
      HttpStatus.CONFLICT,
    code:
      ERROR_CODES
        .USER_EMAIL_ALREADY_EXISTS,
    message:
      'Email already registered'
  })
  async create(
    @Body()
    dto: CreateInvitationDto
  ): Promise<InvitationResponseDto> {
    return this.invitationsService
      .inviteUser(
        dto,
        null
      )
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
      'Invalid invitation token'
  })
  @ApiErrorResponse({
    status:
      HttpStatus.CONFLICT,
    code:
      ERROR_CODES
        .INVITATION_ALREADY_USED,
    message:
      'Invitation has already been used'
  })
  @ApiErrorResponse({
    status:
      HttpStatus.GONE,
    code:
      ERROR_CODES
        .INVITATION_EXPIRED,
    message:
      'Invitation has expired'
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
    message: 'Invitation not found',
    examples: [
      {
        code: ERROR_CODES.INVITATION_NOT_FOUND,
        message: 'Invitation not found'
      },
      {
        code: ERROR_CODES.USER_NOT_FOUND,
        message: 'User not found'
      }
    ]
  })
  @ApiErrorResponse({
    status: HttpStatus.CONFLICT,
    code: ERROR_CODES.INVITATION_ALREADY_USED,
    message: 'Invitation has already been used',
    examples: [
      {
        code: ERROR_CODES.INVITATION_ALREADY_USED,
        message: 'Invitation has already been used'
      },
      {
        code: ERROR_CODES.USER_ALREADY_ACTIVATED,
        message: 'User has already been activated'
      }
    ]
  })
  async resend(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<ResendInvitationResponseDto> {
    return this.invitationsService.resendInvitation(
      id,
      null
    )
  }

  @Post(':id/revoke')
  @HttpCode(HttpStatus.OK)
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
    message: 'Invitation not found'
  })
  @ApiErrorResponse({
    status: HttpStatus.CONFLICT,
    code: ERROR_CODES.INVITATION_ALREADY_USED,
    message: 'Invitation has already been used'
  })
  @ApiErrorResponse({
    status: HttpStatus.CONFLICT,
    code: ERROR_CODES.INVITATION_REVOKED,
    message: 'Invitation has already been revoked'
  })
  async revoke(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<RevokeInvitationResponseDto> {
    return this.invitationsService.revokeInvitation(id)
  }
}