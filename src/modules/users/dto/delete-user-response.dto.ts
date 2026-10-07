import { ApiProperty } from '@nestjs/swagger'

export class DeleteUserResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '8c6b1c2e-1f4a-4d7b-9a11-2b7e5c0d4f21'
  })
  id!: string

  @ApiProperty({
    format: 'date-time',
    example: '2026-10-07T18:00:00.000Z'
  })
  deletedAt!: Date
}
