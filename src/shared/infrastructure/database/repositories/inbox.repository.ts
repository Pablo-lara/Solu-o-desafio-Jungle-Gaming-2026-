import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { InboxMessageEntity } from '../entities/inbox-message.entity.js';

@Injectable()
export class InboxRepository {
  constructor(private readonly em: EntityManager) {}

  async findByMessageAndConsumer(
    messageId: string,
    consumerName: string,
    em: EntityManager,
  ): Promise<InboxMessageEntity | null> {
    return await em.findOne(InboxMessageEntity, { messageId, consumerName });
  }

  async save(
    data: {
      messageId: string;
      consumerName: string;
      payloadHash: string;
    },
    em: EntityManager,
  ): Promise<void> {
    const inbox = em.create(InboxMessageEntity, {
      messageId: data.messageId,
      consumerName: data.consumerName,
      payloadHash: data.payloadHash,
      receivedAt: new Date(),
    });
    em.persist(inbox);
  }
}
