import { ApiProperty } from '@nestjs/swagger'

export class ValidateInvitationResponseDto {
  @ApiProperty({ example: true })
  valid!: boolean

  @ApiProperty({ type: String, format: 'date-time' })
  expiresAt!: Date
}
