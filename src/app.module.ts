import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnv } from './config/env.schema.js';
import { HealthModule } from './modules/health/health.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createTypeOrmConfig } from './database/typeorm/typeorm.config.js';
import { UsersModule } from './modules/users/users.module.js';
import { SessionsModule } from './modules/sessions/sessions.module.js';
import { ResponseInterceptor } from './common/http/interceptors/response.interceptor.js';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './common/http/filters/http-exception.filter.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => createTypeOrmConfig(configService.getOrThrow<string>('DATABASE_URL')),
    }),
    HealthModule,
    UsersModule,
    SessionsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    }
  ]
})
export class AppModule {}
