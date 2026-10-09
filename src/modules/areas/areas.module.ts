import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Area } from './entities/area.entity.js'
import { AreasRepository } from './repositories/areas.repository.js'
import { AuditModule } from '../audit/audit.module.js'
import { AreasService } from './areas.service.js'
import { AreasController } from './areas.controller.js'
import { AuthModule } from '../auth/auth.module.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Area]),
    AuditModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [
    AreasController,
  ],
  providers: [
    AreasRepository,
    AreasService,
  ],
  exports: [
    AreasService,
  ]
})
export class AreasModule {}