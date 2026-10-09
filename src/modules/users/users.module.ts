import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { User } from './entities/user.entity.js'
import { UserArea } from './entities/user-area.entity.js'
import { UsersRepository } from './repositories/users.repository.js'
import { UserAreasRepository } from './repositories/user-areas.repository.js'
import { AreasModule } from '../areas/areas.module.js'
import { AuditModule } from '../audit/audit.module.js'
import { UsersService } from './users.service.js'
import { UsersController } from './users.controller.js'
import { AuthModule } from '../auth/auth.module.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, UserArea
    ]),
    AreasModule,
    AuditModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [
    UsersController
  ],
  providers: [
    UsersRepository, 
    UserAreasRepository,
    UsersService
  ],
  exports: [
    UsersService
  ]
})
export class UsersModule {}