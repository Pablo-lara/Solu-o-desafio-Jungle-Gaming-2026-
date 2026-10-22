import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { IdempotencyKeyEntity } from '../entities/idempotency-key.entity.js';

@Injectable()
export class IdempotencyKeyRepository {
  constructor(private readonly em: EntityManager) {}

  async findByIdempotencyKey(
    key: string,
    em?: EntityManager,
  ): Promise<IdempotencyKeyEntity | null> {
    const entityManager = em ?? this.em.fork();
    return entityManager.findOne(IdempotencyKeyEntity, { idempotencyKey: key });
  }

  async save(
    data: {
      id: string;
      idempotencyKey: string;
      providerId: string;
      externalTransactionId: string;
      status: string;
      balanceAfter: string;
    },
    em?: EntityManager,
  ): Promise<void> {
    const entityManager = em ?? this.em.fork();
    const entity = entityManager.create(IdempotencyKeyEntity, data);
    entityManager.persist(entity);
    if (!em) {
      await entityManager.flush();
    }
  }
}
