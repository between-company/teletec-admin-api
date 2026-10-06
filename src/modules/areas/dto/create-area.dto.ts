import { Transform } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import {
  IsString,
  MaxLength,
  MinLength
} from 'class-validator'

export class CreateAreaDto {
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value
  )
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  @ApiProperty({
    description: 'The name of the area',
    example: 'Area 1'
  })
  name!: string
}