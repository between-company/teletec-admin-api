import { Transform } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class CreateSpecialtyDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  @ApiProperty({
    description: 'Nombre de la especialidad del supervisor',
    example: 'Iluminación'
  })
  name!: string
}
