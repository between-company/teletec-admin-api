import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    type Relation
  } from 'typeorm'
  
  import { AppBaseEntity } from '../../../common/entities/base.entity.js'
  import { User } from '../../users/entities/user.entity.js'
  
  @Entity({ name: 'invitations' })
  @Index('idx_invitations_user_id', ['userId'])
  @Index('idx_invitations_expires_at', ['expiresAt'])
  @Index('idx_invitations_token_hash', ['tokenHash'], {
    unique: true
  })
  export class Invitation extends AppBaseEntity {
    @Column({
      name: 'user_id',
      type: 'uuid'
    })
    userId!: string
  
    @Column({
      name: 'token_hash',
      type: 'varchar',
      length: 64
    })
    tokenHash!: string
  
    @Column({
      name: 'expires_at',
      type: 'timestamptz'
    })
    expiresAt!: Date
  
    @Column({
      name: 'used_at',
      type: 'timestamptz',
      nullable: true
    })
    usedAt!: Date | null
  
    @Column({
      name: 'revoked_at',
      type: 'timestamptz',
      nullable: true
    })
    revokedAt!: Date | null
  
    @Column({
      name: 'created_by_id',
      type: 'uuid',
      nullable: true
    })
    createdById!: string | null
  
    @ManyToOne(() => User, {
      onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'user_id' })
    user!: Relation<User>
  
    @ManyToOne(() => User, {
      nullable: true,
      onDelete: 'SET NULL'
    })
    @JoinColumn({ name: 'created_by_id' })
    createdBy!: Relation<User> | null
  }