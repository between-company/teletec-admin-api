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

  export class CreateUserDto {
    @Transform(({ value }) =>
      typeof value === 'string'
        ? value.trim().toLowerCase()
        : value
    )
    @IsEmail()
    @MaxLength(320)
    @ApiProperty({
      example: 'ana.lopez@teletec.com',
      maxLength: 320
    })
    email!: string
  
    @Transform(({ value }) =>
      typeof value === 'string' ? value.trim() : value
    )
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    @ApiProperty({
      example: 'Ana',
      minLength: 2,
      maxLength: 100
    })
    firstName!: string
  
    @Transform(({ value }) =>
      typeof value === 'string' ? value.trim() : value
    )
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    @ApiProperty({
      example: 'López',
      minLength: 2,
      maxLength: 100
    })
    lastName!: string
  
    @IsOptional()
    @IsString()
    @MaxLength(8)
    @ApiPropertyOptional({
      example: '+52',
      maxLength: 8
    })
    phoneCountryCode?: string
  
    @IsOptional()
    @IsString()
    @MaxLength(30)
    @ApiPropertyOptional({
      example: '5512345678',
      maxLength: 30
    })
    phone?: string
  
    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    @IsUUID('4', { each: true })
    @ApiProperty({
      type: [String],
      format: 'uuid',
      example: ['3fa85f64-5717-4562-b3fc-2c963f66afa6']
    })
    areaIds!: string[]
  }