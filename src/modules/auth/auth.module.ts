import { Module } from '@nestjs/common'
import {
  ConfigModule,
  ConfigService
} from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuditModule } from '../audit/audit.module.js'
import { UsersModule } from '../users/users.module.js'

import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { Session } from '../sessions/entities/session.entity.js'
import { SessionsRepository } from './repositories/sessions.repository.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Session
    ]),
    JwtModule.registerAsync({
      imports: [
        ConfigModule
      ],
      inject: [
        ConfigService
      ],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>(
          'JWT_ACCESS_SECRET'
        )
      })
    }),
    UsersModule,
    AuditModule
  ],
  controllers: [
    AuthController
  ],
  providers: [
    SessionsRepository,
    AuthService
  ],
  exports: [
    AuthService,
    SessionsRepository,
    JwtModule
  ]
})
export class AuthModule {}