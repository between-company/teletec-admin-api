import { ApiProperty } from '@nestjs/swagger'

export class AuthenticatedUserDto {
  @ApiProperty({
    format: 'uuid'
  })
  id!: string

  @ApiProperty({
    example: 'usuario@teletec.com.mx'
  })
  email!: string

  @ApiProperty({
    example: 'Juan'
  })
  firstName!: string

  @ApiProperty({
    example: 'Pérez'
  })
  lastName!: string
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token'
  })
  accessToken!: string

  @ApiProperty({
    example: 900,
    description: 'Access token lifetime in seconds'
  })
  expiresIn!: number

  @ApiProperty({
    type: () => AuthenticatedUserDto
  })
  user!: AuthenticatedUserDto
}