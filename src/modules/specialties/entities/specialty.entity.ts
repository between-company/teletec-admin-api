import { Column, Entity, Index } from 'typeorm'

import { AppBaseEntity } from '../../../common/entities/base.entity.js'

@Entity({ name: 'specialties' })
@Index(['isActive'])
export class Specialty extends AppBaseEntity {
  @Column({
    type: 'varchar',
    length: 150,
    unique: true
  })
  name!: string

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true
  })
  isActive!: boolean
}
