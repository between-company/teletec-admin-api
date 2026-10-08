import {
  ERROR_CODES,
  type ErrorCode
} from '../constants/error-codes.js'

import {
  DEFAULT_APP_LANGUAGE,
  type AppLanguage
} from './app-language.js'

export type BusinessErrorCode = Exclude<
  ErrorCode,
  typeof ERROR_CODES.VALIDATION_ERROR
>

const catalogs: Record<
  AppLanguage,
  Record<BusinessErrorCode, string>
> = {
  es: {
    BAD_REQUEST: 'Solicitud incorrecta',
    UNAUTHORIZED: 'No autorizado',
    FORBIDDEN: 'Acceso denegado',
    NOT_FOUND: 'Recurso no encontrado',
    CONFLICT: 'Conflicto',
    TOO_MANY_REQUESTS: 'Demasiadas solicitudes',
    INTERNAL_SERVER_ERROR: 'Error interno del servidor',

    SESSION_REVOKED: 'La sesión fue revocada',
    SESSION_EXPIRED: 'La sesión expiró',

    AREA_NAME_ALREADY_EXISTS: 'El área ya existe',
    AREA_NOT_FOUND: 'Área no encontrada',

    USER_EMAIL_ALREADY_EXISTS: 'El correo ya está registrado',
    USER_INVALID_AREAS:
      'Una o más áreas no son válidas o están inactivas',
    USER_PHONE_INCOMPLETE:
      'El teléfono y el código de país deben enviarse juntos',
    USER_NOT_FOUND: 'Usuario no encontrado',
    USER_NOT_DELETED: 'El usuario no está eliminado',
    USER_ALREADY_ACTIVATED: 'El usuario ya fue activado',

    INVITATION_INVALID_TOKEN: 'El token de invitación no es válido',
    INVITATION_ALREADY_USED: 'La invitación ya fue utilizada',
    INVITATION_REVOKED: 'La invitación fue revocada',
    INVITATION_EXPIRED: 'La invitación expiró',
    INVITATION_NOT_FOUND: 'Invitación no encontrada',

    PASSWORD_CONFIRMATION_MISMATCH:
      'La confirmación de la contraseña no coincide',

    AUTH_INVALID_CREDENTIALS: 'Correo o contraseña incorrectos',
    AUTH_REFRESH_TOKEN_MISSING: 'Falta el token de actualización',
    AUTH_INVALID_SESSION: 'La sesión no es válida o expiró',
    AUTH_TOKEN_MISSING: 'Falta el token de acceso',
    AUTH_INVALID_TOKEN: 'El token de acceso no es válido o expiró'
  }
}

export function errorMessage(
  code: BusinessErrorCode,
  language: AppLanguage = DEFAULT_APP_LANGUAGE
): string {
  const catalog = catalogs[language] ?? catalogs[DEFAULT_APP_LANGUAGE]

  return catalog[code]
}

export function isBusinessErrorCode(
  code: ErrorCode
): code is BusinessErrorCode {
  return code !== ERROR_CODES.VALIDATION_ERROR
}
