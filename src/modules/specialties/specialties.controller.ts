import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'

import { API_VERSION } from '../../common/constants/api-version.constants.js'
import { ERROR_CODES } from '../../common/http/constants/error-codes.js'
import { errorMessage } from '../../common/http/messages/error-message.catalog.js'
import { ApiErrorResponse } from '../../common/swagger/decorators/api-error-response.decorator.js'
import { ApiPaginatedResponse } from '../../common/swagger/decorators/api-paginated-response.decorator.js'
import { ApiSuccessResponse } from '../../common/swagger/decorators/api-success-response.decorator.js'
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js'
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.js'
import { CreateSpecialtyDto } from './dto/create-specialty.dto.js'
import { ListSpecialtiesQueryDto } from './dto/list-specialties-query.dto.js'
import { SpecialtyResponseDto } from './dto/specialty-response.dto.js'
import { UpdateSpecialtyDto } from './dto/update-specialty.dto.js'
import { SpecialtiesService } from './specialties.service.js'

@ApiTags('Specialties')
@Controller({
  path: 'specialties',
  version: API_VERSION.V1
})
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List specialties'
  })
  @ApiPaginatedResponse(SpecialtyResponseDto)
  @ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    code: ERROR_CODES.VALIDATION_ERROR,
    message: 'Validation failed'
  })
  findAll(@Query() query: ListSpecialtiesQueryDto) {
    return this.specialtiesService.findAll(query)
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get specialty by ID'
  })
  @ApiParam({
    name: 'id',
    format: 'uuid'
  })
  @ApiSuccessResponse(SpecialtyResponseDto)
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    code: ERROR_CODES.SPECIALTY_NOT_FOUND,
    message: errorMessage(ERROR_CODES.SPECIALTY_NOT_FOUND)
  })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.specialtiesService.findById(id)
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a specialty'
  })
  @ApiSuccessResponse(SpecialtyResponseDto, {
    status: 201
  })
  @ApiErrorResponse({
    status: HttpStatus.CONFLICT,
    code: ERROR_CODES.SPECIALTY_NAME_ALREADY_EXISTS,
    message: errorMessage(ERROR_CODES.SPECIALTY_NAME_ALREADY_EXISTS)
  })
  create(@Body() dto: CreateSpecialtyDto, @Req() request: AuthenticatedRequest) {
    return this.specialtiesService.create(dto, request.auth.userId)
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a specialty'
  })
  @ApiParam({
    name: 'id',
    format: 'uuid'
  })
  @ApiSuccessResponse(SpecialtyResponseDto)
  @ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    code: ERROR_CODES.SPECIALTY_NOT_FOUND,
    message: errorMessage(ERROR_CODES.SPECIALTY_NOT_FOUND)
  })
  @ApiErrorResponse({
    status: HttpStatus.CONFLICT,
    code: ERROR_CODES.SPECIALTY_NAME_ALREADY_EXISTS,
    message: errorMessage(ERROR_CODES.SPECIALTY_NAME_ALREADY_EXISTS)
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSpecialtyDto,
    @Req() request: AuthenticatedRequest
  ) {
    return this.specialtiesService.update(id, dto, request.auth.userId)
  }
}
