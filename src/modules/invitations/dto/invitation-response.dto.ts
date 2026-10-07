import { ApiProperty } from '@nestjs/swagger'

import { UserResponseDto } from '../../users/dto/user-response.dto.js'

export class InvitationResponseDto {
  @ApiProperty({
    format: 'uuid',
    example:
      'f255c04d-1c94-4bc7-b31b-cd5076cef7be'
  })
  id!: string

  @ApiProperty({
    type: () => UserResponseDto
  })
  user!: UserResponseDto

  @ApiProperty({
    example: '2026-10-07T23:00:00.000Z'
  })
  expiresAt!: Date

  @ApiProperty({
    example: true,
    description:
      'Indicates whether the invitation email was successfully sent'
  })
  emailSent!: boolean
}