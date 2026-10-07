import { ApiProperty } from '@nestjs/swagger'

import { AuthenticatedUserDto } from './login-response.dto.js'

export class RefreshResponseDto {
  @ApiProperty({
    description: 'New JWT access token'
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