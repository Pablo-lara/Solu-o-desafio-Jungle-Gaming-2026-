import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';

@Entity({ tableName: 'wallet_ledger_entries' })
@Index({ properties: ['walletId'] })
export class WalletLedgerEntryEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'uuid', fieldName: 'wallet_id' })
  walletId!: string;

  @Property({ type: 'uuid', fieldName: 'transaction_id' })
  transactionId!: string;

  @Property({ type: 'varchar', length: 10 })
  direction!: string; // DEBIT | CREDIT

  @Property({
    type: 'numeric',
    precision: 18,
    scale: 2,
    fieldName: 'money_amount',
  })
  moneyAmount!: string;

  @Property({ type: 'varchar', length: 3 })
  currency!: string;

  @Property({
    type: 'numeric',
    precision: 18,
    scale: 2,
    fieldName: 'balance_before',
  })
  balanceBefore!: string;

  @Property({
    type: 'numeric',
    precision: 18,
    scale: 2,
    fieldName: 'balance_after',
  })
  balanceAfter!: string;

  @Property({ type: 'timestamptz', fieldName: 'created_at' })
  createdAt: Date = new Date();
}
