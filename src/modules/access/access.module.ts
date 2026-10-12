import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuditModule } from '../audit/audit.module.js'
import { AuthModule } from '../auth/auth.module.js'
import { Area } from '../areas/entities/area.entity.js'
import { User } from '../users/entities/user.entity.js'
import { AccessController } from './access.controller.js'
import { AccessRepository } from './access.repository.js'
import { AccessService } from './access.service.js'
import { AreaPermission } from './entities/area-permission.entity.js'
import { Permission } from './entities/permission.entity.js'
import { RoleInclusion } from './entities/role-inclusion.entity.js'
import { RolePermission } from './entities/role-permission.entity.js'
import { Role } from './entities/role.entity.js'
import { UserPermission } from './entities/user-permission.entity.js'
import { UserRole } from './entities/user-role.entity.js'
import { PermissionsGuard } from './guards/permissions.guard.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      Permission,
      RolePermission,
      RoleInclusion,
      UserRole,
      AreaPermission,
      UserPermission,
      User,
      Area
    ]),
    AuditModule,
    forwardRef(() => AuthModule)
  ],
  controllers: [AccessController],
  providers: [
    AccessRepository,
    AccessService,
    PermissionsGuard
  ],
  exports: [AccessService, PermissionsGuard]
})
export class AccessModule {}
