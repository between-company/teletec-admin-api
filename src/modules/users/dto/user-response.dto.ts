import { ApiProperty } from '@nestjs/swagger'

export class UserAreaResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
  })
  id!: string

  @ApiProperty({
    example: 'Operaciones Nacionales'
  })
  name!: string
}

export class UserResponseDto {
  @ApiProperty({
    format: 'uuid',
    example: '8c6b1c2e-1f4a-4d7b-9a11-2b7e5c0d4f21'
  })
  id!: string

  @ApiProperty({
    example: 'ana.lopez@teletec.com'
  })
  email!: string

  @ApiProperty({
    example: 'Ana'
  })
  firstName!: string

  @ApiProperty({
    example: 'López'
  })
  lastName!: string

  @ApiProperty({
    type: String,
    nullable: true,
    example: '+52'
  })
  phoneCountryCode!: string | null

  @ApiProperty({
    type: String,
    nullable: true,
    example: '5512345678'
  })
  phone!: string | null

  @ApiProperty({
    example: false
  })
  isActive!: boolean

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    example: null
  })
  activatedAt!: Date | null

  @ApiProperty({
    type: [UserAreaResponseDto]
  })
  areas!: UserAreaResponseDto[]

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
