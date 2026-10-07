import { ApiProperty } from '@nestjs/swagger'

export class ResendInvitationResponseDto {
  @ApiProperty({
    format: 'uuid'
  })
  previousInvitationId!: string

  @ApiProperty({
    format: 'uuid'
  })
  invitationId!: string

  @ApiProperty({
    example: '2026-10-08T02:00:00.000Z'
  })
  expiresAt!: Date

  @ApiProperty({
    example: true,
    description: 'Indicates whether the new invitation email was successfully sent'
  })
  emailSent!: boolean
}