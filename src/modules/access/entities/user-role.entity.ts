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
import { Role } from './role.entity.js'

@Entity({ name: 'user_roles' })
@Unique('uq_user_roles_user_role', ['userId', 'roleId'])
export class UserRole {
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
    name: 'role_id',
    type: 'uuid'
  })
  roleId!: string

  @ManyToOne(() => User, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<User>

  @ManyToOne(() => Role, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'role_id' })
  role!: Relation<Role>

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz'
  })
  createdAt!: Date
}
