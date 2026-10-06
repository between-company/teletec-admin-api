import {
  Body,
  Controller,
  HttpStatus,
  Post
} from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger'

import { API_VERSION } from '../../common/constants/api-version.constants.js'
import { ERROR_CODES } from '../../common/http/constants/error-codes.js'
import { ApiErrorResponse } from '../../common/swagger/decorators/api-error-response.decorator.js'
import { ApiSuccessResponse } from '../../common/swagger/decorators/api-success-response.decorator.js'

import { CreateUserDto } from './dto/create-user.dto.js'
import { UserAreaResponseDto, UserResponseDto } from './dto/user-response.dto.js'
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

  @Post()
  @ApiOperation({
    summary: 'Create a pending user'
  })
  @ApiSuccessResponse(UserResponseDto, {
    status: 201
  })
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
        message: 'Phone and country code must be provided together'
      },
      {
        code: ERROR_CODES.USER_INVALID_AREAS,
        message: 'One or more areas are invalid or inactive'
      }
    ]
  })
  @ApiErrorResponse({
    status: HttpStatus.CONFLICT,
    code: ERROR_CODES.USER_EMAIL_ALREADY_EXISTS,
    message: 'Email already registered'
  })
  create(
    @Body() dto: CreateUserDto
  ) {
    return this.usersService.createPending(dto)
  }
}
