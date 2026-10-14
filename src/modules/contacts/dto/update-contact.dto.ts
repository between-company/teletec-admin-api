import { OmitType, PartialType } from '@nestjs/swagger'
import { CreateContactDto } from './create-contact.dto.js'

export class UpdateContactDto extends PartialType(
  OmitType(CreateContactDto, ['clientId'] as const),
  { skipNullProperties: false }
) {}
