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

import { Role } from './role.entity.js'

@Entity({ name: 'role_inclusions' })
@Unique('uq_role_inclusions_role_included', [
  'roleId',
  'includedRoleId'
])
export class RoleInclusion {
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
    name: 'included_role_id',
    type: 'uuid'
  })
  includedRoleId!: string

  @ManyToOne(() => Role, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'role_id' })
  role!: Relation<Role>

  @ManyToOne(() => Role, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'included_role_id' })
  includedRole!: Relation<Role>

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz'
  })
  createdAt!: Date
}
