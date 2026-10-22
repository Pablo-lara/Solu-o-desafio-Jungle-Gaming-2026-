import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Wallet, WalletState } from '../../../../domain/aggregates/wallet.js';
import { WalletEntity } from '../entities/wallet.entity.js';
import { WalletLedgerEntryEntity } from '../entities/wallet-ledger-entry.entity.js';
import { Money } from '../../../../domain/value-objects/money.js';
import { WalletLedgerEntry } from '../../../../domain/aggregates/wallet-ledger-entry.js';

@Injectable()
export class WalletRepository {
  constructor(
    private readonly em: EntityManager, // <- Adicionar o decorador garante que o NestJS encontra a instância correta
  ) {}

  async save(wallet: Wallet, em: EntityManager = this.em): Promise<void> {
    const entity = em.create(WalletEntity, {
      id: wallet.id,
      playerId: wallet.playerId,
      currency: wallet.currency,
      balanceAmount: wallet.balance.toJSON().amount,
      version: wallet.version,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    });
    await em.persist(entity);
  }

  async update(wallet: Wallet, em: EntityManager = this.em): Promise<void> {
    const entity = await em.findOne(WalletEntity, { id: wallet.id });
    if (!entity) {
      throw new Error('Wallet entity not found for update.');
    }
    entity.balanceAmount = wallet.balance.toJSON().amount;
    entity.version = wallet.version;
    entity.updatedAt = wallet.updatedAt;
    await em.persist(entity);
  }

  async findByIdWithLock(
    walletId: string,
    em: EntityManager = this.em,
  ): Promise<WalletState | null> {
    const connection = em.getConnection() as any;
    const knex = connection.getKnex
      ? connection.getKnex()
      : connection.getBuilder();

    const rawWallet = await knex('wallets')
      .where({ id: walletId })
      .forUpdate()
      .first();

    if (!rawWallet) {
      return null;
    }

    return {
      id: rawWallet.id,
      playerId: rawWallet.player_id,
      currency: rawWallet.currency,
      balance: Money.from({
        amount: rawWallet.balance_amount,
        currency: rawWallet.currency,
      }),
      version: rawWallet.version,
      createdAt: new Date(rawWallet.created_at),
      updatedAt: new Date(rawWallet.updated_at),
    };
  }

  async saveLedger(
    entry: WalletLedgerEntry,
    em: EntityManager = this.em,
  ): Promise<void> {
    const ledgerEntity = em.create(WalletLedgerEntryEntity, {
      id: entry.id,
      walletId: entry.walletId,
      transactionId: entry.transactionId,
      direction: entry.direction,
      moneyAmount: entry.money.toJSON().amount,
      currency: entry.money.currency,
      balanceBefore: entry.balanceBefore.toJSON().amount,
      balanceAfter: entry.balanceAfter.toJSON().amount,
      createdAt: entry.createdAt,
    });
    await em.persist(ledgerEntity);
  }
}
