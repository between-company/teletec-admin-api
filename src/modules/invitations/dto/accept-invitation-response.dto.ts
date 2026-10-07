import {
    ApiProperty
  } from '@nestjs/swagger'
  
export class AcceptInvitationResponseDto {
@ApiProperty({
    format: 'uuid'
})
userId!: string

@ApiProperty({
    format: 'uuid'
})
invitationId!: string

@ApiProperty({
    example: true
})
isActive!: boolean

@ApiProperty({
    example: '2026-10-06T23:30:00.000Z'
})
activatedAt!: Date
}