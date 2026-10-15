import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  ArrayUnique,
  IsArray,
  IsString,
  Matches
} from 'class-validator'

const KEY_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/

function toKeyList(value: unknown): unknown {
  if (!Array.isArray(value)) {
    return value
  }

  return value.map((item) =>
    typeof item === 'string' ? item.trim().toLowerCase() : item
  )
}

export class ReplaceRoleKeysDto {
  @ApiProperty({
    type: [String],
    example: ['admin']
  })
  @Transform(({ value }) => toKeyList(value))
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @Matches(KEY_PATTERN, { each: true })
  roleKeys!: string[]
}

export class ReplacePermissionKeysDto {
  @ApiProperty({
    type: [String],
    example: ['users.read']
  })
  @Transform(({ value }) => toKeyList(value))
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @Matches(KEY_PATTERN, { each: true })
  permissionKeys!: string[]
}
