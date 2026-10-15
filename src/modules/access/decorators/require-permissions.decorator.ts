import { SetMetadata } from '@nestjs/common'

import { REQUIRE_PERMISSIONS } from '../constants/access.constants.js'

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(REQUIRE_PERMISSIONS, permissions)
