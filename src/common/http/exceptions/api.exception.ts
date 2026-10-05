import {
    HttpException,
    type HttpStatus
  } from '@nestjs/common'
  
  import type { ErrorCode } from '../constants/error-codes.js'
  
  interface ApiExceptionOptions {
    statusCode: HttpStatus
    code: ErrorCode
    message: string
    details?: unknown
  }
  
  export class ApiException extends HttpException {
    constructor({
      statusCode,
      code,
      message,
      details
    }: ApiExceptionOptions) {
      super(
        {
          code,
          message,
          details
        },
        statusCode
      )
    }
  }