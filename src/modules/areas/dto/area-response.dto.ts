import { ApiProperty } from '@nestjs/swagger'

export class AreaResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
  })
  id!: string

  @ApiProperty({
    example: 'Operaciones Nacionales'
  })
  name!: string

  @ApiProperty({
    example: true
  })
  isActive!: boolean

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
