import {
  ValidatorConstraint,
  type ValidatorConstraintInterface
} from 'class-validator'

@ValidatorConstraint({
  name: 'passwordLowercase',
  async: false
})
export class PasswordLowercaseConstraint
  implements ValidatorConstraintInterface
{
  validate(value: unknown): boolean {
    return typeof value === 'string' && /[a-z]/.test(value)
  }
}

@ValidatorConstraint({
  name: 'passwordUppercase',
  async: false
})
export class PasswordUppercaseConstraint
  implements ValidatorConstraintInterface
{
  validate(value: unknown): boolean {
    return typeof value === 'string' && /[A-Z]/.test(value)
  }
}
