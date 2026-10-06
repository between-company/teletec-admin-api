import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator'

export class UpdateAreaDto {
  @ApiPropertyOptional({
    example: 'Operaciones Nacionales'
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value
  )
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name?: string
  
  @ApiPropertyOptional({
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}