import type { AppLanguage } from '../messages/app-language.js'

export type ValidationLanguage = AppLanguage

const labels: Record<string, string> = {
  email: 'correo',
  firstName: 'nombre',
  lastName: 'apellido',
  phoneCountryCode: 'código de país',
  phone: 'teléfono',
  areaIds: 'áreas',
  areaId: 'área',
  password: 'contraseña',
  passwordConfirmation: 'confirmación de la contraseña',
  token: 'token de invitación',
  name: 'nombre',
  isActive: 'estado',
  search: 'búsqueda',
  page: 'página',
  limit: 'límite',
  userId: 'usuario',
  status: 'estatus'
}

const requiredRules = new Set([
  'isString',
  'isNotEmpty',
  'isEmail',
  'isUuid',
  'isBoolean',
  'isInt',
  'isArray',
  'isEnum'
])

interface ValidationMessageInput {
  field: string
  rule: string
  value: unknown
  limits: unknown[]
}

const validationBuilders: Record<
  ValidationLanguage,
  (input: ValidationMessageInput) => string
> = {
  es: buildSpanishValidationMessage
}

export function buildValidationMessage(
  language: ValidationLanguage,
  input: ValidationMessageInput
): string {
  return validationBuilders[language](input)
}

function buildSpanishValidationMessage(
  input: ValidationMessageInput
): string {
  const label = labelFor(input.field)

  if (input.rule === 'whitelistValidation') {
    return `El campo ${label} no está permitido`
  }

  if (input.rule === 'passwordLowercase') {
    return 'La contraseña debe incluir al menos una minúscula'
  }

  if (input.rule === 'passwordUppercase') {
    return 'La contraseña debe incluir al menos una mayúscula'
  }

  if (requiredRules.has(input.rule) && isEmpty(input.value)) {
    return `El campo ${label} es requerido`
  }

  const limits = numericLimits(input.limits)

  switch (input.rule) {
    case 'isString':
      return `El campo ${label} debe ser texto`
    case 'isEmail':
      return `El campo ${label} no es un correo válido`
    case 'isNotEmpty':
    case 'arrayNotEmpty':
      return `El campo ${label} es requerido`
    case 'minLength':
      return `El campo ${label} debe tener al menos ${limits[0]} caracteres`
    case 'maxLength':
      return `El campo ${label} debe tener como máximo ${limits[0]} caracteres`
    case 'length':
      return limits[0] === limits[1]
        ? `El campo ${label} debe tener ${limits[0]} caracteres`
        : `El campo ${label} debe tener entre ${limits[0]} y ${limits[1]} caracteres`
    case 'isUuid':
      return `El campo ${label} debe ser un identificador válido`
    case 'isBoolean':
      return `El campo ${label} debe ser verdadero o falso`
    case 'isInt':
      return `El campo ${label} debe ser un número entero`
    case 'min':
      return `El campo ${label} debe ser como mínimo ${limits[0]}`
    case 'max':
      return `El campo ${label} debe ser como máximo ${limits[0]}`
    case 'isArray':
      return `El campo ${label} debe ser una lista`
    case 'arrayUnique':
      return `El campo ${label} no debe tener valores repetidos`
    default:
      return `El campo ${label} no es válido`
  }
}

function labelFor(field: string): string {
  const property = field.split('.').at(-1) ?? field

  return labels[property] ?? property
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

function numericLimits(limits: unknown[]): number[] {
  return limits.filter(
    (limit): limit is number => typeof limit === 'number'
  )
}
