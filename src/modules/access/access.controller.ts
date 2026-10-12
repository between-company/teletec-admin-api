import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags
} from '@nestjs/swagger'

import { API_VERSION } from '../../common/constants/api-version.constants.js'
import { ERROR_CODES } from '../../common/http/constants/error-codes.js'
import { errorMessage } from '../../common/http/messages/error-message.catalog.js'
import { ApiErrorResponse } from '../../common/swagger/decorators/api-error-response.decorator.js'
import { ApiSuccessResponse } from '../../common/swagger/decorators/api-success-response.decorator.js'
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js'
import { AccessService } from './access.service.js'
import { PERMISSIONS } from './constants/access.constants.js'
import { RequirePermissions } from './decorators/require-permissions.decorator.js'
import {
  AreaAccessResponseDto,
  PermissionResponseDto,
  RoleResponseDto,
  UserAccessResponseDto
} from './dto/access-response.dto.js'
import {
  ReplacePermissionKeysDto,
  ReplaceRoleKeysDto
} from './dto/replace-keys.dto.js'
import { PermissionsGuard } from './guards/permissions.guard.js'

@ApiTags('Access')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, PermissionsGuard)
@RequirePermissions(PERMISSIONS.PERMISSIONS_ASSIGN)
@Controller({
  path: 'access',
  version: API_VERSION.V1
})
export class AccessController {
  constructor(
    private readonly accessService: AccessService
  ) {}

  @Get('roles')
  @ApiOperation({
    summary: 'List roles that can be assigned'
  })
  @ApiSuccessResponse(RoleResponseDto, { isArray: true })
  listRoles() {
    return this.accessService.listRoles()
  }

  @Get('permissions')
  @ApiOperation({
    summary: 'List permissions that can be assigned'
  })
  @ApiSuccessResponse(PermissionResponseDto, { isArray: true })
  listPermissions() {
    return this.accessService.listPermissions()
  }

  @Get('users/:userId')
  @ApiOperation({
    summary: 'Show the access of a user and where each permission comes from'
  })
  @ApiParam({
    name: 'userId',
    format: 'uuid'
  })
  @ApiSuccessResponse(UserAccessResponseDto)
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    code: ERROR_CODES.USER_NOT_FOUND,
    message: errorMessage(ERROR_CODES.USER_NOT_FOUND)
  })
  getUserAccess(
    @Param('userId', ParseUUIDPipe) userId: string
  ) {
    return this.accessService.getUserAccess(userId)
  }

  @Put('users/:userId/roles')
  @ApiOperation({
    summary: 'Replace the roles assigned to a user'
  })
  @ApiParam({
    name: 'userId',
    format: 'uuid'
  })
  @ApiSuccessResponse(UserAccessResponseDto)
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    code: ERROR_CODES.ROLE_NOT_FOUND,
    message: errorMessage(ERROR_CODES.ROLE_NOT_FOUND)
  })
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    code: ERROR_CODES.USER_NOT_FOUND,
    message: errorMessage(ERROR_CODES.USER_NOT_FOUND)
  })
  replaceUserRoles(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: ReplaceRoleKeysDto
  ) {
    return this.accessService.replaceUserRoles(
      userId,
      dto.roleKeys
    )
  }

  @Put('users/:userId/permissions')
  @ApiOperation({
    summary: 'Replace the permissions assigned directly to a user'
  })
  @ApiParam({
    name: 'userId',
    format: 'uuid'
  })
  @ApiSuccessResponse(UserAccessResponseDto)
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    code: ERROR_CODES.PERMISSION_NOT_FOUND,
    message: errorMessage(ERROR_CODES.PERMISSION_NOT_FOUND)
  })
  replaceUserPermissions(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: ReplacePermissionKeysDto
  ) {
    return this.accessService.replaceUserPermissions(
      userId,
      dto.permissionKeys
    )
  }

  @Put('areas/:areaId/permissions')
  @ApiOperation({
    summary: 'Replace the permissions granted by an area'
  })
  @ApiParam({
    name: 'areaId',
    format: 'uuid'
  })
  @ApiSuccessResponse(AreaAccessResponseDto)
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    code: ERROR_CODES.PERMISSION_NOT_FOUND,
    message: errorMessage(ERROR_CODES.PERMISSION_NOT_FOUND)
  })
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    code: ERROR_CODES.AREA_NOT_FOUND,
    message: errorMessage(ERROR_CODES.AREA_NOT_FOUND)
  })
  replaceAreaPermissions(
    @Param('areaId', ParseUUIDPipe) areaId: string,
    @Body() dto: ReplacePermissionKeysDto
  ) {
    return this.accessService.replaceAreaPermissions(
      areaId,
      dto.permissionKeys
    )
  }
}
