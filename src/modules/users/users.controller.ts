import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query
} from '@nestjs/common'
import {
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiTags
} from '@nestjs/swagger'

import { API_VERSION } from '../../common/constants/api-version.constants.js'
import { ERROR_CODES } from '../../common/http/constants/error-codes.js'
import { errorMessage } from '../../common/http/messages/error-message.catalog.js'
import { ApiErrorResponse } from '../../common/swagger/decorators/api-error-response.decorator.js'
import { ApiPaginatedResponse } from '../../common/swagger/decorators/api-paginated-response.decorator.js'
import { ApiSuccessResponse } from '../../common/swagger/decorators/api-success-response.decorator.js'

import { DeleteUserResponseDto } from './dto/delete-user-response.dto.js'
import { ListUsersQueryDto } from './dto/list-users-query.dto.js'
import { UpdateUserDto } from './dto/update-user.dto.js'
import {
  UserAreaResponseDto,
  UserResponseDto
} from './dto/user-response.dto.js'
import { UsersService } from './users.service.js'

@ApiTags('Users')
@ApiExtraModels(UserAreaResponseDto)
@Controller({
  path: 'users',
  version: API_VERSION.V1
})
export class UsersController {
  constructor(
    private readonly usersService: UsersService
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List users'
  })
  @ApiPaginatedResponse(UserResponseDto)
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    code: ERROR_CODES.VALIDATION_ERROR,
    message: 'Validation failed'
  })
  findAll(
    @Query() query: ListUsersQueryDto
  ) {
    return this.usersService.findAll(query)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID'
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'User ID'
  })
  @ApiSuccessResponse(UserResponseDto)
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    code: ERROR_CODES.USER_NOT_FOUND,
    message: errorMessage(ERROR_CODES.USER_NOT_FOUND)
  })
  findById(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.usersService.findById(id)
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a user'
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'User ID'
  })
  @ApiSuccessResponse(UserResponseDto)
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    code: ERROR_CODES.VALIDATION_ERROR,
    message: 'Validation failed',
    examples: [
      {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Validation failed'
      },
      {
        code: ERROR_CODES.USER_PHONE_INCOMPLETE,
        message: errorMessage(ERROR_CODES.USER_PHONE_INCOMPLETE)
      },
      {
        code: ERROR_CODES.USER_INVALID_AREAS,
        message: errorMessage(ERROR_CODES.USER_INVALID_AREAS)
      }
    ]
  })
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    code: ERROR_CODES.USER_NOT_FOUND,
    message: errorMessage(ERROR_CODES.USER_NOT_FOUND)
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto
  ) {
    return this.usersService.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Soft delete a user'
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'User ID'
  })
  @ApiSuccessResponse(DeleteUserResponseDto)
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    code: ERROR_CODES.USER_NOT_FOUND,
    message: errorMessage(ERROR_CODES.USER_NOT_FOUND)
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.usersService.remove(id)
  }

  @Post(':id/restore')
  @ApiOperation({
    summary: 'Restore a soft-deleted user'
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'User ID'
  })
  @ApiSuccessResponse(UserResponseDto)
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    code: ERROR_CODES.USER_NOT_FOUND,
    message: errorMessage(ERROR_CODES.USER_NOT_FOUND)
  })
  @ApiErrorResponse({
    status: HttpStatus.CONFLICT,
    code: ERROR_CODES.USER_NOT_DELETED,
    message: errorMessage(ERROR_CODES.USER_NOT_DELETED)
  })
  restore(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.usersService.restore(id)
  }
}
