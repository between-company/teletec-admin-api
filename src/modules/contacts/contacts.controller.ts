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
import { ContactsService } from './contacts.service.js'
import { CreateContactDto } from './dto/create-contact.dto.js'
import { UpdateContactDto } from './dto/update-contact.dto.js'
import { ListContactsQueryDto } from './dto/list-contacts-query.dto.js'
import { ContactResponseDto } from './dto/contact-response.dto.js'
import { DeleteContactResponseDto } from './dto/delete-contact-response.dto.js'

@ApiTags('Contacts')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, PermissionsGuard)
@ApiErrorResponse({
  status: HttpStatus.BAD_REQUEST,
  code: ERROR_CODES.VALIDATION_ERROR,
  message: 'Validation failed'
})
@ApiErrorResponse({
  status: HttpStatus.NOT_FOUND,
  code: ERROR_CODES.CONTACT_NOT_FOUND,
  message: errorMessage(ERROR_CODES.CONTACT_NOT_FOUND)
})
@ApiErrorResponse({
  status: HttpStatus.NOT_FOUND,
  code: ERROR_CODES.CLIENT_NOT_FOUND,
  message: errorMessage(ERROR_CODES.CLIENT_NOT_FOUND)
})
@ApiParam({ name: 'clientId', type: String, format: 'uuid' })
@Controller({ path: 'clients/:clientId/contacts', version: API_VERSION.V1 })
export class ContactsController {
  constructor(private readonly service: ContactsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CLIENT_CONTACTS_READ)
  @ApiOperation({ summary: 'List contacts' })
  @ApiPaginatedResponse(ContactResponseDto)
  findAll(
    @Param('clientId', new ParseUUIDPipe()) clientId: string,
    @Query() query: ListContactsQueryDto
  ) {
    return this.service.findAll(clientId, query)
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.CLIENT_CONTACTS_READ)
  @ApiOperation({ summary: 'Get contact by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiSuccessResponse(ContactResponseDto)
  findById(
    @Param('clientId', new ParseUUIDPipe()) clientId: string,
    @Param('id', new ParseUUIDPipe()) id: string
  ) {
    return this.service.findById(clientId, id)
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CLIENT_CONTACTS_CREATE)
  @ApiOperation({ summary: 'Create a contact' })
  @ApiSuccessResponse(ContactResponseDto, { status: HttpStatus.CREATED })
  create(
    @Param('clientId', new ParseUUIDPipe()) clientId: string,
    @Body() dto: CreateContactDto,
    @Req() request: AuthenticatedRequest
  ) {
    return this.service.create(clientId, dto, request.auth.userId)
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.CLIENT_CONTACTS_UPDATE)
  @ApiOperation({ summary: 'Update a contact' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiSuccessResponse(ContactResponseDto)
  update(
    @Param('clientId', new ParseUUIDPipe()) clientId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateContactDto,
    @Req() request: AuthenticatedRequest
  ) {
    return this.service.update(clientId, id, dto, request.auth.userId)
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.CLIENT_CONTACTS_DELETE)
  @ApiOperation({ summary: 'Soft delete a contact' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiSuccessResponse(DeleteContactResponseDto)
  remove(
    @Param('clientId', new ParseUUIDPipe()) clientId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest
  ) {
    return this.service.remove(clientId, id, request.auth.userId)
  }
}
