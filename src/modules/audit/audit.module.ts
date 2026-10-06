import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuditLog } from './entities/audit-log.entity.js'
import { AuditRepository } from './repositories/audit.repository.js'
import { AuditService } from './audit.service.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog])
  ],
  providers: [
    AuditRepository,
    AuditService
  ],
  exports: [
    AuditService
  ]
})
export class AuditModule {}