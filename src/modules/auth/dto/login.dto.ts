import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator'

export class LoginDto {
  @ApiProperty({
    example: 'usuario@teletec.com.mx'
  })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value
  )
  @IsEmail()
  @MaxLength(320)
  email!: string

  @ApiProperty({
    example: 'MiClaveSegura',
    minLength: 8,
    writeOnly: true
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string
}