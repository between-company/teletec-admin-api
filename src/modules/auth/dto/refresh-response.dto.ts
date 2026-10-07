import { ApiProperty } from '@nestjs/swagger'

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
}