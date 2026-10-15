import { ApiProperty } from '@nestjs/swagger'

export class SpecialtyResponseDto {
  @ApiProperty({
    format: 'uuid'
  })
  id!: string

  @ApiProperty({
    example: 'Iluminación'
  })
  name!: string

  @ApiProperty({
    example: true
  })
  isActive!: boolean

  @ApiProperty({
    format: 'date-time'
  })
  createdAt!: Date

  @ApiProperty({
    format: 'date-time'
  })
  updatedAt!: Date
}
