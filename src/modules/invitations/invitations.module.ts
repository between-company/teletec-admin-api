import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Invitation } from './entities/invitation.entity.js'
import { InvitationsRepository } from './repositories/invitations.repository.js'
import { InvitationsService } from './invitations.service.js'
import { UsersModule } from '../users/users.module.js'
import { AuditModule } from '../audit/audit.module.js'
import { EmailModule } from '../email/email.module.js'
import { InvitationsController } from './invitations.controller.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invitation
    ]),
    UsersModule,
    AuditModule,
    EmailModule,
  ],
  controllers: [
    InvitationsController
  ],
  providers: [
    InvitationsRepository,
    InvitationsService
  ],
  exports: [
    InvitationsService
  ]
})
export class InvitationsModule {}