import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RoleResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty({ example: 'admin' })
  key!: string

  @ApiProperty({ example: 'Admin' })
  name!: string
}

export class PermissionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty({ example: 'users.invite' })
  key!: string

  @ApiProperty({ example: 'Invitar usuarios' })
  name!: string

  @ApiProperty({ example: 'users' })
  module!: string
}

export class AccessOriginDto {
  @ApiProperty({
    enum: ['role', 'area', 'direct']
  })
  type!: 'role' | 'area' | 'direct'

  @ApiPropertyOptional({ example: 'admin' })
  roleKey?: string

  @ApiPropertyOptional({ example: 'Admin' })
  roleName?: string

  @ApiPropertyOptional({ example: 'admin' })
  throughRoleKey?: string

  @ApiPropertyOptional({ example: 'Admin' })
  throughRoleName?: string

  @ApiPropertyOptional({ format: 'uuid' })
  areaId?: string

  @ApiPropertyOptional({ example: 'Espectáculos' })
  areaName?: string
}

export class AccessGrantDto {
  @ApiProperty({ example: 'users.invite' })
  key!: string

  @ApiProperty({ example: 'Invitar usuarios' })
  name!: string

  @ApiProperty({ type: [AccessOriginDto] })
  origins!: AccessOriginDto[]
}

export class UserAccessResponseDto {
  @ApiProperty({ format: 'uuid' })
  userId!: string

  @ApiProperty({ type: [RoleResponseDto] })
  roles!: RoleResponseDto[]

  @ApiProperty({ type: [AccessGrantDto] })
  grants!: AccessGrantDto[]

  @ApiProperty({
    type: [String],
    description:
      'Claves efectivas, incluidas las de consulta que otorga una clave de administración'
  })
  permissions!: string[]
}

export class AreaAccessResponseDto {
  @ApiProperty({ format: 'uuid' })
  areaId!: string

  @ApiProperty({ type: [AccessGrantDto] })
  grants!: AccessGrantDto[]
}
