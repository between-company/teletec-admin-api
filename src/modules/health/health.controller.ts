import { Controller, Get } from '@nestjs/common'
import { API_VERSION } from '../../common/constants/api-version.constants.js'

@Controller({
  path: 'health',
  version: API_VERSION.V1
})
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  }
}