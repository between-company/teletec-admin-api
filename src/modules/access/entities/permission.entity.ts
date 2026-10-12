import { Column, Entity, Index } from 'typeorm'

import { AppBaseEntity } from '../../../common/entities/base.entity.js'

@Entity({ name: 'permissions' })
export class Permission extends AppBaseEntity {
  @Column({
    type: 'varchar',
    length: 150,
    unique: true
  })
  key!: string

  @Column({
    type: 'varchar',
    length: 150
  })
  name!: string

  @Index()
  @Column({
    type: 'varchar',
    length: 100
  })
  module!: string
}
