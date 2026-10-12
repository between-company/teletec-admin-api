import { Column, Entity } from 'typeorm'

import { AppBaseEntity } from '../../../common/entities/base.entity.js'

@Entity({ name: 'roles' })
export class Role extends AppBaseEntity {
  @Column({
    type: 'varchar',
    length: 100,
    unique: true
  })
  key!: string

  @Column({
    type: 'varchar',
    length: 150
  })
  name!: string
}
