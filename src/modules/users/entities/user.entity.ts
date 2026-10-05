import {
    Column,
    DeleteDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    type Relation
  } from 'typeorm'
  
  import { AppBaseEntity } from '../../../common/entities/base.entity.js'
  import { Session } from '../../sessions/entities/session.entity.js'
  
  @Entity({ name: 'users' })
  @Index('idx_users_deleted_at', ['deletedAt'])
  @Index('idx_users_is_active', ['isActive'])
  export class User extends AppBaseEntity {
    @Column({
      type: 'varchar',
      length: 320,
      unique: true
    })
    email!: string
  
    @Column({
      name: 'password_hash',
      type: 'varchar',
      length: 255
    })
    passwordHash!: string
  
    @Column({
      name: 'first_name',
      type: 'varchar',
      length: 100
    })
    firstName!: string
  
    @Column({
      name: 'last_name',
      type: 'varchar',
      length: 100
    })
    lastName!: string
  
    @Column({
      name: 'is_active',
      type: 'boolean',
      default: true
    })
    isActive!: boolean
  
    @DeleteDateColumn({
      name: 'deleted_at',
      type: 'timestamptz',
      nullable: true
    })
    deletedAt!: Date | null
  
    @Column({
      name: 'deleted_by_id',
      type: 'uuid',
      nullable: true
    })
    deletedById!: string | null
  
    @ManyToOne(() => User, (user) => user.deletedUsers, {
      nullable: true,
      onDelete: 'SET NULL'
    })
    @JoinColumn({ name: 'deleted_by_id' })
    deletedBy!: Relation<User> | null
  
    @OneToMany(() => User, (user) => user.deletedBy)
    deletedUsers!: Relation<User[]>
  
    @OneToMany(() => Session, (session) => session.user)
    sessions!: Relation<Session[]>
  
    @OneToMany(() => Session, (session) => session.revokedBy)
    revokedSessions!: Relation<Session[]>
  }