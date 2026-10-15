import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Client } from './entities/client.entity.js'
import { ClientsRepository } from './repositories/clients.repository.js'
import { ClientsService } from './clients.service.js'
import { ClientsController } from './clients.controller.js'
import { AuditModule } from '../audit/audit.module.js'
import { AuthModule } from '../auth/auth.module.js'
import { AccessModule } from '../access/access.module.js'
import { Contact } from '../contacts/entities/contact.entity.js'
import { ContactsRepository } from '../contacts/repositories/contacts.repository.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, Contact]),
    AuditModule,
    forwardRef(() => AuthModule),
    AccessModule
  ],
  controllers: [ClientsController],
  providers: [ClientsRepository, ContactsRepository, ClientsService],
  exports: [ClientsRepository, ClientsService, ContactsRepository]
})
export class ClientsModule {}
