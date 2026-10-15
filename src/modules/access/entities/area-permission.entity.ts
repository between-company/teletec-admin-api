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
import { Permission } from './permission.entity.js'

@Entity({ name: 'area_permissions' })
@Unique('uq_area_permissions_area_permission', [
  'areaId',
  'permissionId'
])
export class AreaPermission {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index()
  @Column({
    name: 'area_id',
    type: 'uuid'
  })
  areaId!: string

  @Index()
  @Column({
    name: 'permission_id',
    type: 'uuid'
  })
  permissionId!: string

  @ManyToOne(() => Area, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'area_id' })
  area!: Relation<Area>

  @ManyToOne(() => Permission, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'permission_id' })
  permission!: Relation<Permission>

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz'
  })
  createdAt!: Date
}
