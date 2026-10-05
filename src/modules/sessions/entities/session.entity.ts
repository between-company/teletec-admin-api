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
  
  @Entity({ name: 'sessions' })
  @Index('idx_sessions_user_id', ['userId'])
  @Index('idx_sessions_user_revoked', ['userId', 'revokedAt'])
  @Index('idx_sessions_expires_at', ['expiresAt'])
  export class Session extends AppBaseEntity {
    @Column({
      name: 'user_id',
      type: 'uuid'
    })
    userId!: string
  
    @ManyToOne(() => User, (user) => user.sessions, {
      onDelete: 'RESTRICT'
    })
    @JoinColumn({ name: 'user_id' })
    user!: Relation<User>
  
    @Column({
      name: 'refresh_token_hash',
      type: 'varchar',
      length: 128,
      unique: true
    })
    refreshTokenHash!: string
  
    @Column({
      name: 'device_name',
      type: 'varchar',
      length: 255,
      nullable: true
    })
    deviceName!: string | null
  
    @Column({
      name: 'user_agent',
      type: 'text',
      nullable: true
    })
    userAgent!: string | null
  
    @Column({
      name: 'ip_address',
      type: 'inet',
      nullable: true
    })
    ipAddress!: string | null
  
    @Column({
      name: 'last_seen_at',
      type: 'timestamptz',
      default: () => 'CURRENT_TIMESTAMP'
    })
    lastSeenAt!: Date
  
    @Column({
      name: 'expires_at',
      type: 'timestamptz'
    })
    expiresAt!: Date
  
    @Column({
      name: 'revoked_at',
      type: 'timestamptz',
      nullable: true
    })
    revokedAt!: Date | null
  
    @Column({
      name: 'revoked_reason',
      type: 'varchar',
      length: 255,
      nullable: true
    })
    revokedReason!: string | null
  
    @Column({
      name: 'revoked_by_id',
      type: 'uuid',
      nullable: true
    })
    revokedById!: string | null
  
    @ManyToOne(() => User, (user) => user.revokedSessions, {
      nullable: true,
      onDelete: 'SET NULL'
    })
    @JoinColumn({ name: 'revoked_by_id' })
    revokedBy!: Relation<User> | null
  }