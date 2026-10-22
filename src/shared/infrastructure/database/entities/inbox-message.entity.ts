import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'inbox_messages' })
export class InboxMessageEntity {
  @PrimaryKey({ type: 'varchar', fieldName: 'message_id' })
  messageId!: string;

  @PrimaryKey({ type: 'varchar', fieldName: 'consumer_name' })
  consumerName!: string;

  @Property({ type: 'varchar', fieldName: 'payload_hash' })
  payloadHash!: string;

  @Property({ type: 'timestamptz', fieldName: 'received_at' })
  receivedAt!: Date;

  @Property({ type: 'timestamptz', fieldName: 'processed_at', nullable: true })
  processedAt?: Date;
}
