import { PickType } from '@nestjs/swagger'
import { AcceptInvitationDto } from './accept-invitation.dto.js'

export class ValidateInvitationDto extends PickType(
  AcceptInvitationDto,
  ['token'] as const
) {}
