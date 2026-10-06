import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    type Relation
  } from 'typeorm'
  
  import { Area } from '../../areas/entities/area.entity.js'
  import { User } from './user.entity.js'
  
  @Entity({ name: 'user_areas' })
  @Unique(
    'uq_user_areas_user_area',
    ['userId', 'areaId']
  )
  @Index('idx_user_areas_user_id', ['userId'])
  @Index('idx_user_areas_area_id', ['areaId'])
  export class UserArea {
    @PrimaryGeneratedColumn('uuid')
    id!: string
  
    @Column({
      name: 'user_id',
      type: 'uuid'
    })
    userId!: string
  
    @Column({
      name: 'area_id',
      type: 'uuid'
    })
    areaId!: string
  
    @ManyToOne(
      () => User,
      (user) => user.userAreas,
      {
        onDelete: 'CASCADE'
      }
    )
    @JoinColumn({ name: 'user_id' })
    user!: Relation<User>
  
    @ManyToOne(
      () => Area,
      (area) => area.userAreas,
      {
        onDelete: 'RESTRICT'
      }
    )
    @JoinColumn({ name: 'area_id' })
    area!: Relation<Area>
  
    @CreateDateColumn({
      name: 'created_at',
      type: 'timestamptz'
    })
    createdAt!: Date
  }