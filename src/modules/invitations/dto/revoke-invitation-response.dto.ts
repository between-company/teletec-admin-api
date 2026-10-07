import { ApiProperty } from '@nestjs/swagger'

export class RevokeInvitationResponseDto {
  @ApiProperty({
    format: 'uuid'
  })
  invitationId!: string

  @ApiProperty({
    example: '2026-10-07T02:30:00.000Z'
  })
  revokedAt!: Date
}