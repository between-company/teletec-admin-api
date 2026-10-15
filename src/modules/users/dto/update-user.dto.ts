import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength
} from 'class-validator'

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Ana',
    minLength: 2,
    maxLength: 100
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName?: string

  @ApiPropertyOptional({
    example: 'López',
    minLength: 2,
    maxLength: 100
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName?: string

  @ApiProperty({
    example: '+52',
    maxLength: 8
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(8)
  phoneCountryCode!: string

  @ApiProperty({
    example: '5512345678',
    maxLength: 30
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone!: string

  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    example: ['3fa85f64-5717-4562-b3fc-2c963f66afa6']
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  areaIds?: string[]

  @ApiPropertyOptional({
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
