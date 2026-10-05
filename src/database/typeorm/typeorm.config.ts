import type { TypeOrmModuleOptions } from '@nestjs/typeorm'

export const createTypeOrmConfig = (
  databaseUrl: string
): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: databaseUrl,
  autoLoadEntities: true,
  synchronize: false,
  logging: false
})