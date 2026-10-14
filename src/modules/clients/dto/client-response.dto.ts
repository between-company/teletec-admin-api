import { ApiProperty } from '@nestjs/swagger'

export class ClientResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty({})
  name!: string

  @ApiProperty({ type: String, nullable: true })
  rfc!: string | null

  @ApiProperty({ type: String, nullable: true })
  sapNumber!: string | null

  @ApiProperty({ format: 'date-time' })
  registeredAt!: Date

  @ApiProperty({})
  isActive!: boolean

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date
}
