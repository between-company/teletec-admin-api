import {
    Column,
    Entity,
    Index,
    OneToMany,
    type Relation
  } from 'typeorm'
  
  import { UserArea } from '../../users/entities/user-area.entity.js'
  import { AppBaseEntity } from '../../../common/entities/base.entity.js'
  
  @Entity({ name: 'areas' })
  @Index(['isActive'])
  export class Area extends AppBaseEntity {
    @Column({
      type: 'varchar',
      length: 150,
      unique: true,
    })
    name!: string
  
    @Column({
      name: 'is_active',
      type: 'boolean',
      default: true
    })
    isActive!: boolean

    @OneToMany(
      () => UserArea,
      (userArea) => userArea.area
    )
    userAreas!: Relation<UserArea[]>
}