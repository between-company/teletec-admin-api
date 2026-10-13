import dataSource from '../typeorm/data-source.js'
import {
  PERMISSION_CATALOG,
  assertAccessCatalog,
} from '../../modules/access/constants/access.catalog.js'

async function seedPermissions(): Promise<void> {
  assertAccessCatalog()
  await dataSource.initialize()

  try {
    await dataSource.query(
      `INSERT INTO permissions (key, name, module)
       SELECT item.key, item.name, item.module
       FROM UNNEST($1::text[], $2::text[], $3::text[])
         AS item(key, name, module)
       ON CONFLICT (key) DO UPDATE
       SET name = EXCLUDED.name,
           module = EXCLUDED.module,
           updated_at = now()`,
      [
        PERMISSION_CATALOG.map((item) => item.key),
        PERMISSION_CATALOG.map((item) => item.name),
        PERMISSION_CATALOG.map((item) => item.module),
      ],
    )

    console.log(`Permisos listos: ${PERMISSION_CATALOG.length}`)
  } finally {
    await dataSource.destroy()
  }
}

seedPermissions().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
