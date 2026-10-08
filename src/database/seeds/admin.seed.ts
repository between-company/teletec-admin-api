import * as argon2 from 'argon2'

import dataSource from '../typeorm/data-source.js'
import { User } from '../../modules/users/entities/user.entity.js'

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

    if (existing) {
      console.log(`Admin user already exists: ${email}`)
      return
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id
    })

    const user = users.create({
      email,
      passwordHash,
      firstName: 'Administrador',
      lastName: 'TELETEC',
      phoneCountryCode: null,
      phone: null,
      isActive: true,
      activatedAt: new Date()
    })

    const saved = await users.save(user)

    console.log(`Admin user created: ${saved.email}`)
  } finally {
    await dataSource.destroy()
  }
}

seedAdmin().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
