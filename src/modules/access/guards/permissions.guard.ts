import {
  CanActivate,
  ExecutionContext,
  Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import type { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface.js'
import { AccessService } from '../access.service.js'
import { REQUIRE_PERMISSIONS } from '../constants/access.constants.js'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessService: AccessService
  ) {}

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>()
    const required =
      this.reflector.getAllAndOverride<string[]>(
        REQUIRE_PERMISSIONS,
        [context.getHandler(), context.getClass()]
      ) ?? []

    await this.accessService.assertGranted(
      request.auth.userId,
      required
    )

    return true
  }
}
