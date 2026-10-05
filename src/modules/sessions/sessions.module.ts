import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Session } from './entities/session.entity.js'

@Module({
  imports: [TypeOrmModule.forFeature([Session])]
})
export class SessionsModule {}