import { ApiProperty } from '@nestjs/swagger'
import { ContactType } from '../enums/contact-type.enum.js'

export class ContactResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty({ format: 'uuid' })
  clientId!: string

  @ApiProperty({})
  name!: string

  @ApiProperty({ type: String, nullable: true })
  email!: string | null

  @ApiProperty({ type: String, example: '+52', maxLength: 8, nullable: true })
  phoneCountryCode!: string | null

  @ApiProperty({ type: String, nullable: true })
  phone!: string | null

  @ApiProperty({ type: String, example: '+52', maxLength: 8, nullable: true })
  officePhoneCountryCode!: string | null

  @ApiProperty({ type: String, nullable: true })
  officePhone!: string | null

  @ApiProperty({ enum: ContactType })
  type!: ContactType

  @ApiProperty({})
  isActive!: boolean

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date

  @ApiProperty({ format: 'date-time' })
  updatedAt!: Date
}
