import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity({ tableName: 'outbox_messages' })
export class OutboxMessageEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'uuid', fieldName: 'aggregate_id' })
  aggregateId!: string;

  @Property({ type: 'varchar', fieldName: 'event_type' })
  eventType!: string;

  @Property({ type: 'json' })
  payload!: Record<string, unknown>;

  @Property({ type: 'timestamptz', fieldName: 'occurred_at' })
  occurredAt!: Date;

  @Property({ type: 'int', default: 0 })
  attempts: number = 0;

  @Property({
    type: 'timestamptz',
    fieldName: 'next_attempt_at',
    nullable: true,
  })
  nextTestAttemptAt?: Date;

  @Property({ type: 'timestamptz', fieldName: 'published_at', nullable: true })
  publishedAt?: Date;
}
