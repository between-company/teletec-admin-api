import {
    Global,
    MiddlewareConsumer,
    Module,
    NestModule,
    RequestMethod
  } from '@nestjs/common'
  
  import { RequestContextMiddleware } from './request-context.middleware.js'
  import { RequestContextService } from './request-context.service.js'
  
  @Global()
  @Module({
    providers: [
      RequestContextService,
      RequestContextMiddleware
    ],
    exports: [
      RequestContextService
    ]
  })
  export class RequestContextModule
    implements NestModule {
    configure(
      consumer: MiddlewareConsumer
    ): void {
      consumer
        .apply(RequestContextMiddleware)
        .forRoutes({
          path: '{*path}',
          method: RequestMethod.ALL
        })
    }
  }