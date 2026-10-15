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

import { Permission } from './permission.entity.js'
import { Role } from './role.entity.js'

@Entity({ name: 'role_permissions' })
@Unique('uq_role_permissions_role_permission', [
  'roleId',
  'permissionId'
])
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index()
  @Column({
    name: 'role_id',
    type: 'uuid'
  })
  roleId!: string

  @Index()
  @Column({
    name: 'permission_id',
    type: 'uuid'
  })
  permissionId!: string

  @ManyToOne(() => Role, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'role_id' })
  role!: Relation<Role>

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
