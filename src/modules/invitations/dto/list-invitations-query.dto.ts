import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min
} from 'class-validator'

export enum InvitationListStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REVOKED = 'revoked',
  EXPIRED = 'expired'
}

export class ListInvitationsQueryDto {
  @ApiPropertyOptional({
    enum: InvitationListStatus,
    isArray: true,
    example: [
      InvitationListStatus.PENDING,
      InvitationListStatus.REVOKED
    ],
    description: 'Filter by one or more statuses. Repeat the query param or separate values with commas. Omit it to return every status.'
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined
    }

    const rawValues = Array.isArray(value) ? value : [value]
    const statuses = rawValues
      .flatMap((item) => String(item).split(','))
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

    if (statuses.length === 0) {
      return undefined
    }

    return statuses
  })
  @IsArray()
  @ArrayUnique()
  @IsEnum(InvitationListStatus, { each: true })
  status?: InvitationListStatus[]

  @ApiPropertyOptional({
    example: 'ana.lopez',
    description: 'Search invitations by user email, first name or last name'
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value
  )
  @IsString()
  @MaxLength(320)
  search?: string

  @ApiPropertyOptional({
    format: 'uuid',
    example: '8c6b1c2e-1f4a-4d7b-9a11-2b7e5c0d4f21',
    description: 'Filter invitations of one user'
  })
  @IsOptional()
  @IsUUID('4')
  userId?: string

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    minimum: 1,
    description: 'Page number'
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
    maximum: 100,
    description: 'Number of records per page'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20
}
