import { ApiProperty } from '@nestjs/swagger'

import { UserResponseDto } from '../../users/dto/user-response.dto.js'

export class InvitationDetailResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: 'f255c04d-1c94-4bc7-b31b-cd5076cef7be'
  })
  id!: string

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-10-07T23:00:00.000Z'
  })
  expiresAt!: Date

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    example: null
  })
  usedAt!: Date | null

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    example: null
  })
  revokedAt!: Date | null

  @ApiProperty({
    type: () => UserResponseDto
  })
  user!: UserResponseDto

  @ApiProperty({
    format: 'date-time',
    example: '2026-10-06T22:00:00.000Z'
  })
  createdAt!: Date

  @ApiProperty({
    format: 'date-time',
    example: '2026-10-06T22:00:00.000Z'
  })
  updatedAt!: Date
}
