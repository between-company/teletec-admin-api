import { applyDecorators, Type } from '@nestjs/common'
import {
  ApiExtraModels,
  ApiResponse,
  getSchemaPath
} from '@nestjs/swagger'

interface ApiSuccessResponseOptions {
  status?: number
  isArray?: boolean
}

export function ApiSuccessResponse<TModel extends Type<unknown>>(
  model: TModel,
  options: ApiSuccessResponseOptions = {}
) {
  const {
    status = 200,
    isArray = false
  } = options

  const dataSchema = isArray
    ? {
        type: 'array',
        items: {
          $ref: getSchemaPath(model)
        }
      }
    : {
        $ref: getSchemaPath(model)
      }

  return applyDecorators(
    ApiExtraModels(model),

    ApiResponse({
      status,
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: dataSchema
        },
        required: [
          'success',
          'data'
        ]
      }
    })
  )
}