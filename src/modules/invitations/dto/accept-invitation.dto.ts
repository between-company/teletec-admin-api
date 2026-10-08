import {
    ApiProperty
  } from '@nestjs/swagger'
  
  import {
    IsString,
    Length,
    Matches,
    MaxLength,
    MinLength,
    Validate
  } from 'class-validator'

  import { PasswordLowercaseConstraint } from '../../../common/http/validation/password.constraints.js'
  import { PasswordUppercaseConstraint } from '../../../common/http/validation/password.constraints.js'
  
  export class AcceptInvitationDto {
    @ApiProperty({
      description:
        'Invitation token received by email',
      example:
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    })
    @IsString()
    @Length(64, 64)
    @Matches(/^[a-f0-9]{64}$/i)
    token!: string
  
    @ApiProperty({
      example: 'MiClaveSegura',
      minLength: 8,
      writeOnly: true,
      description:
        'Minimum 8 characters with at least one uppercase and one lowercase letter'
    })
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    @Validate(PasswordLowercaseConstraint)
    @Validate(PasswordUppercaseConstraint)
    password!: string
  
    @ApiProperty({
      example: 'MiClaveSegura',
      writeOnly: true
    })
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    passwordConfirmation!: string
  }