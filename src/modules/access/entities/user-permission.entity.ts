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

import { User } from '../../users/entities/user.entity.js'
import { Permission } from './permission.entity.js'

@Entity({ name: 'user_permissions' })
@Unique('uq_user_permissions_user_permission', [
  'userId',
  'permissionId'
])
export class UserPermission {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index()
  @Column({
    name: 'user_id',
    type: 'uuid'
  })
  userId!: string

  @Index()
  @Column({
    name: 'permission_id',
    type: 'uuid'
  })
  permissionId!: string

  @ManyToOne(() => User, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<User>

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
