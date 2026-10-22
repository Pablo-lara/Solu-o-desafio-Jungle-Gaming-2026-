import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'idempotency_keys' })
export class IdempotencyKeyEntity {
  @PrimaryKey({ type: 'string' })
  id!: string; // transactionId

  @Property({ type: 'string', unique: true })
  idempotencyKey!: string;

  @Property({ type: 'string' })
  providerId!: string;

  @Property({ type: 'string' })
  externalTransactionId!: string;

  @Property({ type: 'string' })
  status!: string;

  @Property({ type: 'numeric', precision: 18, scale: 2 })
  balanceAfter!: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();
}
