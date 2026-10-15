import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuditModule } from '../audit/audit.module.js'
import { AuthModule } from '../auth/auth.module.js'
import { Specialty } from './entities/specialty.entity.js'
import { SpecialtiesRepository } from './repositories/specialties.repository.js'
import { SpecialtiesController } from './specialties.controller.js'
import { SpecialtiesService } from './specialties.service.js'

@Module({
  imports: [TypeOrmModule.forFeature([Specialty]), AuditModule, AuthModule],
  controllers: [SpecialtiesController],
  providers: [SpecialtiesRepository, SpecialtiesService],
  exports: [SpecialtiesService]
})
export class SpecialtiesModule {}
