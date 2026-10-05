import {
    ArgumentsHost,
    Catch,
    HttpException,
    HttpStatus,
    Logger,
    type ExceptionFilter
  } from '@nestjs/common'
  
  import {
    ERROR_CODES,
    type ErrorCode
  } from '../constants/error-codes.js'
  
  import type { ApiErrorResponse } from '../interfaces/api-response.interface.js'
  
  interface HttpResponseLike {
    status(code: number): HttpResponseLike
    json(body: unknown): void
  }
  
  interface ExceptionResponse {
    code?: ErrorCode
    message?: string | string[]
    details?: unknown
  }
  
  interface NormalizedError {
    statusCode: number
    code: ErrorCode
    message: string
    details?: unknown
  }
  
  @Catch()
  export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name)
  
    catch(exception: unknown, host: ArgumentsHost) {
      const context = host.switchToHttp()
  
      const response = context.getResponse<HttpResponseLike>()
  
      const normalized = this.normalizeException(exception)
  
      const body: ApiErrorResponse = {
        success: false,
        error: {
          statusCode: normalized.statusCode,
          code: normalized.code,
          message: normalized.message,
          ...(normalized.details !== undefined && {
            details: normalized.details
          })
        }
      }
  
      response.status(normalized.statusCode).json(body)
    }
  
    private normalizeException(exception: unknown): NormalizedError {
      if (!(exception instanceof HttpException)) {
        this.logUnknownException(exception)
  
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: 'Internal server error'
        }
      }
  
      const statusCode = exception.getStatus()
      const response = exception.getResponse()
      const defaultError = this.getDefaultError(statusCode)
  
      if (typeof response === 'string') {
        return {
          statusCode,
          ...defaultError
        }
      }
  
      const exceptionResponse = response as ExceptionResponse
  
      if (Array.isArray(exceptionResponse.message)) {
        return {
          statusCode,
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Validation failed',
          details: {
            messages: exceptionResponse.message
          }
        }
      }
  
      if (exceptionResponse.code) {
        return {
          statusCode,
          code: exceptionResponse.code,
          message:
            exceptionResponse.message ??
            defaultError.message,
          details: exceptionResponse.details
        }
      }
  
      return {
        statusCode,
        ...defaultError
      }
    }
  
    private getDefaultError(
      statusCode: number
    ): Pick<NormalizedError, 'code' | 'message'> {
      switch (statusCode) {
        case HttpStatus.BAD_REQUEST:
          return {
            code: ERROR_CODES.BAD_REQUEST,
            message: 'Bad request'
          }
  
        case HttpStatus.UNAUTHORIZED:
          return {
            code: ERROR_CODES.UNAUTHORIZED,
            message: 'Unauthorized'
          }
  
        case HttpStatus.FORBIDDEN:
          return {
            code: ERROR_CODES.FORBIDDEN,
            message: 'Forbidden'
          }
  
        case HttpStatus.NOT_FOUND:
          return {
            code: ERROR_CODES.NOT_FOUND,
            message: 'Resource not found'
          }
  
        case HttpStatus.CONFLICT:
          return {
            code: ERROR_CODES.CONFLICT,
            message: 'Conflict'
          }
  
        case HttpStatus.TOO_MANY_REQUESTS:
          return {
            code: ERROR_CODES.TOO_MANY_REQUESTS,
            message: 'Too many requests'
          }
  
        default:
          return {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: 'Internal server error'
          }
      }
    }
  
    private logUnknownException(exception: unknown) {
      if (exception instanceof Error) {
        this.logger.error(
          exception.message,
          exception.stack
        )
  
        return
      }
  
      this.logger.error('Unknown exception', exception)
    }
  }