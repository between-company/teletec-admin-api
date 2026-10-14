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
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
import { API_VERSION } from '../../common/constants/api-version.constants.js'
import { ApiSuccessResponse } from '../../common/swagger/decorators/api-success-response.decorator.js'
import { ApiPaginatedResponse } from '../../common/swagger/decorators/api-paginated-response.decorator.js'
import { ApiErrorResponse } from '../../common/swagger/decorators/api-error-response.decorator.js'
import { ERROR_CODES } from '../../common/http/constants/error-codes.js'
import { errorMessage } from '../../common/http/messages/error-message.catalog.js'
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js'
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.js'
import { PERMISSIONS } from '../access/constants/access.constants.js'
import { RequirePermissions } from '../access/decorators/require-permissions.decorator.js'
import { PermissionsGuard } from '../access/guards/permissions.guard.js'
import { ClientsService } from './clients.service.js'
import { CreateClientDto } from './dto/create-client.dto.js'
import { UpdateClientDto } from './dto/update-client.dto.js'
import { ListClientsQueryDto } from './dto/list-clients-query.dto.js'
import { ClientResponseDto } from './dto/client-response.dto.js'
import { DeleteClientResponseDto } from './dto/delete-client-response.dto.js'

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, PermissionsGuard)
@ApiErrorResponse({
  status: HttpStatus.BAD_REQUEST,
  code: ERROR_CODES.VALIDATION_ERROR,
  message: 'Validation failed'
})
@ApiErrorResponse({
  status: HttpStatus.NOT_FOUND,
  code: ERROR_CODES.CLIENT_NOT_FOUND,
  message: errorMessage(ERROR_CODES.CLIENT_NOT_FOUND)
})
@Controller({ path: 'clients', version: API_VERSION.V1 })
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CLIENTS_READ)
  @ApiOperation({ summary: 'List clients' })
  @ApiPaginatedResponse(ClientResponseDto)
  findAll(@Query() query: ListClientsQueryDto) {
    return this.service.findAll(query)
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.CLIENTS_READ)
  @ApiOperation({ summary: 'Get client by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiSuccessResponse(ClientResponseDto)
  findById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findById(id)
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CLIENTS_CREATE)
  @ApiOperation({ summary: 'Create a client' })
  @ApiSuccessResponse(ClientResponseDto, { status: HttpStatus.CREATED })
  create(@Body() dto: CreateClientDto, @Req() request: AuthenticatedRequest) {
    return this.service.create(dto, request.auth.userId)
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.CLIENTS_UPDATE)
  @ApiOperation({ summary: 'Update a client' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiSuccessResponse(ClientResponseDto)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateClientDto,
    @Req() request: AuthenticatedRequest
  ) {
    return this.service.update(id, dto, request.auth.userId)
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.CLIENTS_DELETE)
  @ApiOperation({ summary: 'Soft delete a client' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiSuccessResponse(DeleteClientResponseDto)
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest
  ) {
    return this.service.remove(id, request.auth.userId)
  }
}
