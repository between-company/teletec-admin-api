import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  type Relation
} from 'typeorm'

import { AppBaseEntity } from '../../../common/entities/base.entity.js'
import { Contact } from '../../contacts/entities/contact.entity.js'

@Entity({ name: 'clients' })
@Index('idx_clients_is_active', ['isActive'])
@Index('idx_clients_deleted_at', ['deletedAt'])
export class Client extends AppBaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name!: string

  @Column({ type: 'varchar', length: 13, nullable: true })
  rfc!: string | null

  @Column({ name: 'sap_number', type: 'varchar', length: 50, nullable: true })
  sapNumber!: string | null

  @Column({
    name: 'registered_at',
    type: 'timestamptz',
    default: () => 'now()',
    insert: false,
    update: false
  })
  registeredAt!: Date

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null

  @OneToMany(() => Contact, (contact) => contact.client)
  contacts!: Relation<Contact[]>
}
