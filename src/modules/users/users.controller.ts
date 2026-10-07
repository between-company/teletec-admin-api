import {
  Controller
} from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'

import { API_VERSION } from '../../common/constants/api-version.constants.js'

import { UserAreaResponseDto } from './dto/user-response.dto.js'

@ApiTags('Users')
@ApiExtraModels(UserAreaResponseDto)
@Controller({
  path: 'users',
  version: API_VERSION.V1
})
export class UsersController {}
