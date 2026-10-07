import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsOptional,
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

  @ApiPropertyOptional({
    example: '+52',
    maxLength: 8,
    nullable: true
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsString()
  @MaxLength(8)
  phoneCountryCode?: string | null

  @ApiPropertyOptional({
    example: '5512345678',
    maxLength: 30,
    nullable: true
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsString()
  @MaxLength(30)
  phone?: string | null

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
