import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength
} from 'class-validator'

export class CreateInvitationDto {
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
    example: 'Juan'
  })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value
  )
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName!: string

  @ApiProperty({
    example: 'Pérez'
  })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value
  )
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName!: string

  @ApiPropertyOptional({
    example: '+52'
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value
  )
  @IsString()
  @MaxLength(8)
  phoneCountryCode?: string

  @ApiPropertyOptional({
    example: '4271234567'
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value
  )
  @IsString()
  @MaxLength(30)
  phone?: string

  @ApiProperty({
    type: [String],
    example: [
      '7e7e49ef-335f-45ec-bb47-0d86486845df'
    ]
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  areaIds!: string[]
}