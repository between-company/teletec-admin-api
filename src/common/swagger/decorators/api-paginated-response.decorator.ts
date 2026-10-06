import {
    applyDecorators,
    Type
  } from '@nestjs/common'
  import {
    ApiExtraModels,
    ApiResponse,
    getSchemaPath
  } from '@nestjs/swagger'
  
  export function ApiPaginatedResponse<
    TModel extends Type<unknown>
  >(
    model: TModel
  ) {
    return applyDecorators(
      ApiExtraModels(model),
  
      ApiResponse({
        status: 200,
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
  
            data: {
              type: 'array',
              items: {
                $ref: getSchemaPath(model)
              }
            },
  
            meta: {
              type: 'object',
              properties: {
                pagination: {
                  type: 'object',
                  properties: {
                    page: {
                      type: 'number',
                      example: 1
                    },
                    limit: {
                      type: 'number',
                      example: 20
                    },
                    totalItems: {
                      type: 'number',
                      example: 35
                    },
                    totalPages: {
                      type: 'number',
                      example: 2
                    },
                    hasNextPage: {
                      type: 'boolean',
                      example: true
                    },
                    hasPreviousPage: {
                      type: 'boolean',
                      example: false
                    }
                  }
                }
              }
            }
          },
          required: [
            'success',
            'data',
            'meta'
          ]
        }
      })
    )
  }