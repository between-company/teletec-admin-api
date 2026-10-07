import {
  Controller,
  Get,
  HttpStatus,
  Query
} from '@nestjs/common'
import {
  ApiExtraModels,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger'

import { API_VERSION } from '../../common/constants/api-version.constants.js'
import { ERROR_CODES } from '../../common/http/constants/error-codes.js'
import { ApiErrorResponse } from '../../common/swagger/decorators/api-error-response.decorator.js'
import { ApiPaginatedResponse } from '../../common/swagger/decorators/api-paginated-response.decorator.js'

import { ListUsersQueryDto } from './dto/list-users-query.dto.js'
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
}
