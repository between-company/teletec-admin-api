import * as argon2 from 'argon2'

import dataSource from '../typeorm/data-source.js'
import { User } from '../../modules/users/entities/user.entity.js'
import { ROLE_KEYS } from '../../modules/access/constants/access.constants.js'
import { Role } from '../../modules/access/entities/role.entity.js'
import { UserRole } from '../../modules/access/entities/user-role.entity.js'

const email = (
  process.env.SEED_ADMIN_EMAIL ?? 'admin@teletec.local'
)
  .trim()
  .toLowerCase()

const password = process.env.SEED_ADMIN_PASSWORD

async function seedAdmin(): Promise<void> {
  if (!password) {
    throw new Error('SEED_ADMIN_PASSWORD is required')
  }

  await dataSource.initialize()

  try {
    const users = dataSource.getRepository(User)
    const existing = await users.findOne({
      where: { email },
      withDeleted: true
    })

    let user = existing

    if (user) {
      console.log(`Admin user already exists: ${email}`)
    } else {
      const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id
      })

      user = await users.save(
        users.create({
          email,
          passwordHash,
          firstName: 'Administrador',
          lastName: 'TELETEC',
          phoneCountryCode: null,
          phone: null,
          isActive: true,
          activatedAt: new Date()
        })
      )

      console.log(`Admin user created: ${user.email}`)
    }

    const role = await dataSource.getRepository(Role).findOne({
      where: { key: ROLE_KEYS.SUPERADMIN }
    })

    if (!role) {
      throw new Error(
        `Role ${ROLE_KEYS.SUPERADMIN} is missing. Run the migrations first`
      )
    }

    await dataSource
      .getRepository(UserRole)
      .createQueryBuilder()
      .insert()
      .values({ userId: user.id, roleId: role.id })
      .orIgnore()
      .execute()

    console.log(`Role ${role.key} assigned to ${user.email}`)
  } finally {
    await dataSource.destroy()
  }
}

seedAdmin().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
