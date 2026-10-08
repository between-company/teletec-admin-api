import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query
  } from '@nestjs/common'
  
import { AreasService } from './areas.service.js'
import { CreateAreaDto } from './dto/create-area.dto.js'
import { API_VERSION } from '../../common/constants/api-version.constants.js'
import { UpdateAreaDto } from './dto/update-area.dto.js'
import { ListAreasQueryDto } from './dto/list-areas-query.dto.js'
import { AreaResponseDto } from './dto/area-response.dto.js'
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { ApiSuccessResponse } from '../../common/swagger/decorators/api-success-response.decorator.js'
import { ApiErrorResponse } from '../../common/swagger/decorators/api-error-response.decorator.js'
import { ERROR_CODES } from '../../common/http/constants/error-codes.js'
import { errorMessage } from '../../common/http/messages/error-message.catalog.js'
import { ApiPaginatedResponse } from '../../common/swagger/decorators/api-paginated-response.decorator.js'
  
  @ApiTags('Areas')
  @Controller({
    path: 'areas',
    version: API_VERSION.V1
  })
  export class AreasController {
    constructor(
      private readonly areasService: AreasService
    ) {}

    @Get()
    @ApiOperation({
      summary: 'List areas'
    })
    @ApiPaginatedResponse(AreaResponseDto)
    @ApiErrorResponse({
      status: HttpStatus.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Validation failed'
    })
    findAll(
      @Query() query: ListAreasQueryDto
    ) {
      return this.areasService.findAll(query)
    }

    @Get(':id')
    @ApiOperation({
      summary: 'Get area by ID'
    })
    @ApiParam({
      name: 'id',
      type: String,
      format: 'uuid',
      description: 'Area ID'
    })
    @ApiSuccessResponse(AreaResponseDto)
    @ApiErrorResponse({
      status: HttpStatus.NOT_FOUND,
      code: ERROR_CODES.AREA_NOT_FOUND,
      message: errorMessage(ERROR_CODES.AREA_NOT_FOUND)
    })
    findById(
      @Param('id', new ParseUUIDPipe())
      id: string
    ) {
      return this.areasService.findById(id)
    }
  
    @Post()
    @ApiOperation({
      summary: 'Create an area'
    })
    @ApiSuccessResponse(
      AreaResponseDto,
      {
        status: 201
      }
    )
    @ApiErrorResponse({
      status: HttpStatus.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Validation failed'
    })
    @ApiErrorResponse({
      status: HttpStatus.CONFLICT,
      code: ERROR_CODES.AREA_NAME_ALREADY_EXISTS,
      message: errorMessage(ERROR_CODES.AREA_NAME_ALREADY_EXISTS)
    })
    create(
      @Body() dto: CreateAreaDto
    ) {
      return this.areasService.create(dto)
    }

    @Patch(':id')
    @ApiOperation({
      summary: 'Update an area'
    })
    @ApiSuccessResponse(AreaResponseDto)
    @ApiErrorResponse({
      status: HttpStatus.BAD_REQUEST,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Validation failed'
    })
    @ApiErrorResponse({
      status: HttpStatus.NOT_FOUND,
      code: ERROR_CODES.AREA_NOT_FOUND,
      message: errorMessage(ERROR_CODES.AREA_NOT_FOUND)
    })
    @ApiErrorResponse({
      status: HttpStatus.CONFLICT,
      code: ERROR_CODES.AREA_NAME_ALREADY_EXISTS,
      message: errorMessage(ERROR_CODES.AREA_NAME_ALREADY_EXISTS)
    })
    update(
      @Param('id') id: string,
      @Body() dto: UpdateAreaDto
    ) {
      return this.areasService.update(id, dto)
    }
  }