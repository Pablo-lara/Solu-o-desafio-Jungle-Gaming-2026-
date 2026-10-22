import { Entity, PrimaryKey, Property, Unique, Check } from '@mikro-orm/core';

@Entity({ tableName: 'wallets' })
@Unique({ properties: ['playerId', 'currency'] })
@Check({ expression: 'balance_amount >= 0' })
export class WalletEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'uuid', fieldName: 'player_id' })
  playerId!: string;

  @Property({ type: 'varchar', length: 3 })
  currency!: string;

  @Property({
    type: 'numeric',
    precision: 18,
    scale: 2,
    fieldName: 'balance_amount',
  })
  balanceAmount!: string;

  @Property({ type: 'integer' })
  version!: number;

  @Property({ type: 'timestamptz', fieldName: 'created_at' })
  createdAt: Date = new Date();

  @Property({
    type: 'timestamptz',
    fieldName: 'updated_at',
    onUpdate: () => new Date(),
  })
  updatedAt: Date = new Date();
}
