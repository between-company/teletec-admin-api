import { BadRequestException } from '@nestjs/common'
import {
  getMetadataStorage,
  type ValidationError
} from 'class-validator'

import { ERROR_CODES } from '../constants/error-codes.js'

import { DEFAULT_APP_LANGUAGE } from '../messages/app-language.js'

import { buildValidationMessage } from './validation-message.catalog.js'

interface ValidationFieldError {
  field: string
  message: string
}

const language = DEFAULT_APP_LANGUAGE

export function validationExceptionFactory(
  errors: ValidationError[]
): BadRequestException {
  const fields = flattenValidationErrors(errors)
  const messages = fields.map((field) => field.message)

  return new BadRequestException({
    code: ERROR_CODES.VALIDATION_ERROR,
    message: 'Validation failed',
    details: {
      messages: messages.length > 0
        ? messages
        : ['La solicitud no es válida'],
      fields
    }
  })
}

function flattenValidationErrors(
  errors: ValidationError[],
  parent?: string
): ValidationFieldError[] {
  return errors.flatMap((error) => {
    const field = parent
      ? `${parent}.${error.property}`
      : error.property
    const ownErrors = Object.entries(error.constraints ?? {}).map(
      ([rule]) => ({
        field,
        message: buildValidationMessage(language, {
          field,
          rule,
          value: error.value,
          limits: limitsFor(error, rule)
        })
      })
    )
    const childErrors = flattenValidationErrors(
      error.children ?? [],
      field
    )

    return [...ownErrors, ...childErrors]
  })
}

function limitsFor(
  error: ValidationError,
  rule: string
): unknown[] {
  const target = error.target?.constructor

  if (typeof target !== 'function') {
    return []
  }

  const metadatas = getMetadataStorage().getTargetValidationMetadatas(
    target,
    target.name,
    true,
    false
  )
  const metadata = metadatas.find((item) => {
    return (
      item.propertyName === error.property &&
      (item.name === rule || item.type === rule)
    )
  })

  return metadata?.constraints ?? []
}
