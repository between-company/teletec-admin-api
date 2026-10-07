import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  Brackets,
  DeepPartial,
  EntityManager,
  In,
  IsNull,
  MoreThan,
  Repository,
  type SelectQueryBuilder
} from 'typeorm'

import { Invitation } from '../entities/invitation.entity.js'
import { InvitationListStatus } from '../dto/list-invitations-query.dto.js'

@Injectable()
export class InvitationsRepository {
  constructor(
    @InjectRepository(Invitation)
    private readonly repository: Repository<Invitation>
  ) {}

  async findAll(filters: {
    status?: InvitationListStatus
    search?: string
    userId?: string
    page: number
    limit: number
  }): Promise<{
    items: Invitation[]
    totalItems: number
  }> {
    const filtered = this.repository
      .createQueryBuilder('invitation')
      .withDeleted()
      .innerJoin('invitation.user', 'user')

    if (filters.userId) {
      filtered.andWhere('invitation.userId = :userId', {
        userId: filters.userId
      })
    }

    if (filters.search) {
      const search = `%${filters.search}%`

      filtered.andWhere(
        new Brackets((searchQuery) => {
          searchQuery
            .where('user.email ILIKE :search', { search })
            .orWhere('user.firstName ILIKE :search', { search })
            .orWhere('user.lastName ILIKE :search', { search })
        })
      )
    }

    this.applyStatusFilter(filtered, filters.status)

    const totalItems = await filtered.clone().getCount()

    const pageInvitations = await filtered
      .clone()
      .select([
        'invitation.id',
        'invitation.createdAt'
      ])
      .orderBy('invitation.createdAt', 'DESC')
      .addOrderBy('invitation.id', 'ASC')
      .offset((filters.page - 1) * filters.limit)
      .limit(filters.limit)
      .getMany()

    if (pageInvitations.length === 0) {
      return {
        items: [],
        totalItems
      }
    }

    const ids = pageInvitations.map((invitation) => invitation.id)
    const invitations = await this.findDetailsByIds(ids)
    const invitationsById = new Map(
      invitations.map((invitation) => [invitation.id, invitation])
    )

    return {
      items: ids.flatMap((id) => {
        const invitation = invitationsById.get(id)

        return invitation ? [invitation] : []
      }),
      totalItems
    }
  }

  findDetailById(
    id: string
  ): Promise<Invitation | null> {
    return this.detailQuery()
      .where('invitation.id = :id', { id })
      .getOne()
  }

  create(
    data: DeepPartial<Invitation>,
    manager?: EntityManager
  ): Invitation {
    return this.getRepository(manager).create(data)
  }

  save(
    invitation: Invitation,
    manager?: EntityManager
  ): Promise<Invitation> {
    return this.getRepository(manager).save(invitation)
  }

  findByTokenHash(
    tokenHash: string,
    manager?: EntityManager
  ): Promise<Invitation | null> {
    return this.getRepository(manager).findOne({
      where: {
        tokenHash
      }
    })
  }

  findByTokenHashForUpdate(
    tokenHash: string,
    manager: EntityManager
  ): Promise<Invitation | null> {
    return manager.getRepository(Invitation).findOne({
      where: {
        tokenHash
      },
      lock: {
        mode: 'pessimistic_write'
      }
    })
  }

  findByIdForUpdate(
    id: string,
    manager: EntityManager
  ): Promise<Invitation | null> {
    return manager.getRepository(Invitation).findOne({
      where: {
        id
      },
      lock: {
        mode: 'pessimistic_write'
      }
    })
  }

  findByIdWithUser(
    id: string,
    manager?: EntityManager
  ): Promise<Invitation | null> {
    return this.getRepository(manager).findOne({
      where: {
        id
      },
      relations: {
        user: true
      }
    })
  }

  findActiveByUserId(
    userId: string,
    manager?: EntityManager
  ): Promise<Invitation | null> {
    return this.getRepository(manager).findOne({
      where: {
        userId,
        usedAt: IsNull(),
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date())
      },
      order: {
        createdAt: 'DESC'
      }
    })
  }

  private findDetailsByIds(
    ids: string[]
  ): Promise<Invitation[]> {
    return this.detailQuery()
      .where({
        id: In(ids)
      })
      .getMany()
  }

  private detailQuery() {
    return this.repository
      .createQueryBuilder('invitation')
      .withDeleted()
      .innerJoinAndSelect('invitation.user', 'user')
      .leftJoinAndSelect('user.userAreas', 'userArea')
      .leftJoinAndSelect('userArea.area', 'area')
      .select([
        'invitation.id',
        'invitation.userId',
        'invitation.expiresAt',
        'invitation.usedAt',
        'invitation.revokedAt',
        'invitation.createdAt',
        'invitation.updatedAt',
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.phoneCountryCode',
        'user.phone',
        'user.isActive',
        'user.activatedAt',
        'user.createdAt',
        'user.updatedAt',
        'userArea.id',
        'userArea.userId',
        'userArea.areaId',
        'area.id',
        'area.name'
      ])
  }

  private applyStatusFilter(
    query: SelectQueryBuilder<Invitation>,
    status?: InvitationListStatus
  ): void {
    const now = new Date()

    if (status === InvitationListStatus.ACCEPTED) {
      query.andWhere('invitation.usedAt IS NOT NULL')
      return
    }

    if (status === InvitationListStatus.REVOKED) {
      query.andWhere('invitation.usedAt IS NULL')
      query.andWhere('invitation.revokedAt IS NOT NULL')
      return
    }

    if (status === InvitationListStatus.EXPIRED) {
      query.andWhere('invitation.usedAt IS NULL')
      query.andWhere('invitation.revokedAt IS NULL')
      query.andWhere('invitation.expiresAt <= :now', { now })
      return
    }

    if (status === InvitationListStatus.PENDING) {
      query.andWhere('invitation.usedAt IS NULL')
      query.andWhere('invitation.revokedAt IS NULL')
      query.andWhere('invitation.expiresAt > :now', { now })
    }
  }

  private getRepository(
    manager?: EntityManager
  ): Repository<Invitation> {
    return manager
      ? manager.getRepository(Invitation)
      : this.repository
  }
}