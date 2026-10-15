import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'

export class ListSpecialtiesQueryDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Filtra especialidades por estado'
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true
    if (value === 'false') return false

    return value
  })
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional({
    example: 'Audio',
    description: 'Busca especialidades por nombre'
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(150)
  search?: string

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1

  @ApiPropertyOptional({
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20
}
