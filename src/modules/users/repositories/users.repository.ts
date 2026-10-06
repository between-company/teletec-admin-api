import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  EntityManager,
  Repository
} from 'typeorm'

import { User } from '../entities/user.entity.js'

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>
  ) {}

  findById(
    id: string,
    manager?: EntityManager
  ): Promise<User | null> {
    return this.getRepository(manager).findOne({
      where: {
        id
      }
    })
  }

  findByEmail(
    email: string,
    manager?: EntityManager
  ): Promise<User | null> {
    return this.getRepository(manager).findOne({
      where: {
        email
      }
    })
  }

  findByEmailIncludingDeleted(
    email: string,
    manager?: EntityManager
  ): Promise<User | null> {
    return this.getRepository(manager).findOne({
      where: {
        email
      },
      withDeleted: true
    })
  }

  create(
    data: Partial<User>,
    manager?: EntityManager
  ): User {
    return this.getRepository(manager).create(data)
  }

  save(
    user: User,
    manager?: EntityManager
  ): Promise<User> {
    return this.getRepository(manager).save(user)
  }

  private getRepository(
    manager?: EntityManager
  ): Repository<User> {
    return manager
      ? manager.getRepository(User)
      : this.repository
  }
}