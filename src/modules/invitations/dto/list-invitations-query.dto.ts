import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
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
    example: InvitationListStatus.PENDING,
    description: 'Filter invitations by current status'
  })
  @IsOptional()
  @IsEnum(InvitationListStatus)
  status?: InvitationListStatus

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
