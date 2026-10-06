import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

interface ApiErrorExample {
  code: string
  message: string
}

interface ApiErrorResponseOptions {
  status: number
  code: string
  message: string
  examples?: ApiErrorExample[]
}

export function ApiErrorResponse({
  status,
  code,
  message,
  examples
}: ApiErrorResponseOptions) {
  const errorExamples = examples ?? [{ code, message }]

  return applyDecorators(
    ApiResponse({
      status,
      examples: Object.fromEntries(
        errorExamples.map((example) => [
          example.code,
          {
            summary: example.code,
            value: {
              success: false,
              error: {
                statusCode: status,
                code: example.code,
                message: example.message
              }
            }
          }
        ])
      ),
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'object',
            properties: {
              statusCode: {
                type: 'number',
                example: status
              },
              code: {
                type: 'string',
                example: code
              },
              message: {
                type: 'string',
                example: message
              },
              details: {
                nullable: true
              }
            },
            required: [
              'statusCode',
              'code',
              'message'
            ]
          }
        },
        required: [
          'success',
          'error'
        ]
      }
    })
  )
}