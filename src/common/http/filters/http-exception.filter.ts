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
  import { DEFAULT_APP_LANGUAGE } from '../messages/app-language.js'
  import {
    errorMessage,
    isBusinessErrorCode
  } from '../messages/error-message.catalog.js'
  
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
          message: errorMessage(
            ERROR_CODES.INTERNAL_SERVER_ERROR,
            DEFAULT_APP_LANGUAGE
          )
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
        const fallback = typeof exceptionResponse.message === 'string'
          ? exceptionResponse.message
          : defaultError.message

        return {
          statusCode,
          code: exceptionResponse.code,
          message: this.messageFor(
            exceptionResponse.code,
            fallback
          ),
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
          return this.defaultError(ERROR_CODES.BAD_REQUEST)
  
        case HttpStatus.UNAUTHORIZED:
          return this.defaultError(ERROR_CODES.UNAUTHORIZED)
  
        case HttpStatus.FORBIDDEN:
          return this.defaultError(ERROR_CODES.FORBIDDEN)
  
        case HttpStatus.NOT_FOUND:
          return this.defaultError(ERROR_CODES.NOT_FOUND)
  
        case HttpStatus.CONFLICT:
          return this.defaultError(ERROR_CODES.CONFLICT)
  
        case HttpStatus.TOO_MANY_REQUESTS:
          return this.defaultError(ERROR_CODES.TOO_MANY_REQUESTS)
  
        default:
          return this.defaultError(ERROR_CODES.INTERNAL_SERVER_ERROR)
      }
    }
  
    private messageFor(
      code: ErrorCode,
      fallback: string
    ): string {
      if (!isBusinessErrorCode(code)) {
        return fallback
      }

      return errorMessage(code, DEFAULT_APP_LANGUAGE)
    }

    private defaultError(
      code: ErrorCode
    ): Pick<NormalizedError, 'code' | 'message'> {
      return {
        code,
        message: this.messageFor(code, code)
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