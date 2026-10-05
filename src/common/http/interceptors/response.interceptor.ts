import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor
  } from '@nestjs/common'
  import { map, type Observable } from 'rxjs'
  
  import { isApiPayload } from '../helpers/api-response.helper.js'
  import type { ApiSuccessResponse } from '../interfaces/api-response.interface.js'
  
  @Injectable()
  export class ResponseInterceptor
    implements NestInterceptor
  {
    intercept(
      _context: ExecutionContext,
      next: CallHandler
    ): Observable<ApiSuccessResponse<unknown>> {
      return next.handle().pipe(
        map((result: unknown) => {
          if (isApiPayload(result)) {
            return {
              success: true,
              data: result.data,
              meta: result.meta
            }
          }
  
          return {
            success: true,
            data: result === undefined ? null : result
          }
        })
      )
    }
  }