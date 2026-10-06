import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn
  } from 'typeorm'
  
  import { AuditAction } from '../enums/audit-action.enum.js'
  import { AuditEntityType } from '../enums/audit-entity-type.enum.js'
  
  @Entity({ name: 'audit_logs' })
  @Index(['entityType', 'entityId'])
  @Index(['actorUserId'])
  @Index(['action'])
  @Index(['createdAt'])
  export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id!: string
  
    @Column({
      name: 'actor_user_id',
      type: 'uuid',
      nullable: true
    })
    actorUserId!: string | null
  
    @Column({
      name: 'actor_session_id',
      type: 'uuid',
      nullable: true
    })
    actorSessionId!: string | null
  
    @Column({
      type: 'varchar',
      length: 100
    })
    action!: AuditAction
  
    @Column({
      name: 'entity_type',
      type: 'varchar',
      length: 100
    })
    entityType!: AuditEntityType
  
    @Column({
      name: 'entity_id',
      type: 'uuid',
      nullable: true
    })
    entityId!: string | null
  
    @Column({
      name: 'actor_snapshot',
      type: 'jsonb',
      nullable: true
    })
    actorSnapshot!: Record<string, unknown> | null
  
    @Column({
      name: 'target_snapshot',
      type: 'jsonb',
      nullable: true
    })
    targetSnapshot!: Record<string, unknown> | null
  
    @Column({
      name: 'before_state',
      type: 'jsonb',
      nullable: true
    })
    before!: Record<string, unknown> | null
  
    @Column({
      name: 'after_state',
      type: 'jsonb',
      nullable: true
    })
    after!: Record<string, unknown> | null
  
    @Column({
      type: 'jsonb',
      nullable: true
    })
    metadata!: Record<string, unknown> | null
  
    @Column({
      name: 'ip_address',
      type: 'inet',
      nullable: true
    })
    ipAddress!: string | null
  
    @Column({
      name: 'user_agent',
      type: 'text',
      nullable: true
    })
    userAgent!: string | null
  
    @Column({
      name: 'request_id',
      type: 'varchar',
      length: 100,
      nullable: true
    })
    requestId!: string | null
  
    @CreateDateColumn({
      name: 'created_at',
      type: 'timestamptz'
    })
    createdAt!: Date
  }