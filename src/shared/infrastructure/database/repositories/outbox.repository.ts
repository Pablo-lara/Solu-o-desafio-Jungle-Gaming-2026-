import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { OutboxMessageEntity } from '../entities/outbox-message.entity.js';

@Injectable()
export class OutboxRepository {
  constructor(private readonly em: EntityManager) {}

  async save(
    data: {
      id: string;
      aggregateId: string;
      eventType: string;
      payload: Record<string, unknown>;
      occurredAt: Date;
    },
    em: EntityManager,
  ): Promise<void> {
    const outbox = em.create(OutboxMessageEntity, {
      id: data.id,
      aggregateId: data.aggregateId,
      eventType: data.eventType,
      payload: data.payload,
      occurredAt: data.occurredAt,
      attempts: 0,
    });
    em.persist(outbox);
  }
}
