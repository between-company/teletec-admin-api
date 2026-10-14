import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Contact } from './entities/contact.entity.js'
import { ContactsService } from './contacts.service.js'
import { ContactsController } from './contacts.controller.js'
import { AuditModule } from '../audit/audit.module.js'
import { AuthModule } from '../auth/auth.module.js'
import { AccessModule } from '../access/access.module.js'
import { ClientsModule } from '../clients/clients.module.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Contact]),
    ClientsModule,
    AuditModule,
    forwardRef(() => AuthModule),
    AccessModule
  ],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService]
})
export class ContactsModule {}
