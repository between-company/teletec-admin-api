import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  type Relation
} from 'typeorm'

import { AppBaseEntity } from '../../../common/entities/base.entity.js'
import { Client } from '../../clients/entities/client.entity.js'
import { ContactType } from '../enums/contact-type.enum.js'

@Entity({ name: 'contacts' })
@Index('idx_contacts_client_id', ['clientId'])
@Index('idx_contacts_type', ['type'])
@Index('idx_contacts_is_active', ['isActive'])
@Index('idx_contacts_deleted_at', ['deletedAt'])
export class Contact extends AppBaseEntity {
  @Column({ name: 'client_id', type: 'uuid' })
  clientId!: string

  @ManyToOne(() => Client, (client) => client.contacts, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'client_id',
    foreignKeyConstraintName: 'fk_contacts_client_id'
  })
  client!: Relation<Client>

  @Column({ type: 'varchar', length: 150 })
  name!: string

  @Column({ type: 'varchar', length: 320, nullable: true })
  email!: string | null

  @Column({ name: 'phone_country_code', type: 'varchar', length: 8, nullable: true })
  phoneCountryCode!: string | null

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone!: string | null

  @Column({ name: 'office_phone_country_code', type: 'varchar', length: 8, nullable: true })
  officePhoneCountryCode!: string | null

  @Column({ name: 'office_phone', type: 'varchar', length: 30, nullable: true })
  officePhone!: string | null

  @Column({ type: 'enum', enum: ContactType, enumName: 'contact_type_enum' })
  type!: ContactType

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null
}
