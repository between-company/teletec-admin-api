import 'dotenv/config'

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DataSource } from 'typeorm'

import { validateEnv } from '../../config/env.schema.js'

const env = validateEnv(process.env)

const currentDir = dirname(fileURLToPath(import.meta.url))

export default new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,

  synchronize: false,

  entities: [
    join(currentDir, '../../modules/**/*.entity.{ts,js}')
  ],

  migrations: [
    join(currentDir, '../migrations/*.{ts,js}')
  ],

  migrationsTableName: 'migrations'
})