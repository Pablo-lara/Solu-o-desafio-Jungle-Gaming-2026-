import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Wallet } from '../../domain/aggregates/wallet.js';
import { Money, MoneyProps } from '../../domain/value-objects/money.js';
import {
  WalletLedgerEntry,
  LedgerDirection,
} from '../../domain/aggregates/wallet-ledger-entry.js';
import { WalletRepository } from '../../shared/infrastructure/database/repositories/wallet.repository.js';

@Injectable()
export class OpenWalletUseCase {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly em: EntityManager,
  ) {}

  async execute(input: { playerId: string; initialBalance: MoneyProps }) {
    const initialMoney = Money.from(input.initialBalance);
    const walletId = crypto.randomUUID();

    const wallet = Wallet.open({
      id: walletId,
      playerId: input.playerId,
      initialBalance: initialMoney,
    });

    let ledgerEntry: WalletLedgerEntry | undefined;
    if (initialMoney.isPositive()) {
      ledgerEntry = WalletLedgerEntry.create({
        id: crypto.randomUUID(),
        walletId: wallet.id,
        transactionId: crypto.randomUUID(),
        direction: LedgerDirection.Credit,
        money: initialMoney,
        balanceBefore: Money.zero(initialMoney.currency),
        balanceAfter: initialMoney,
      });
    }

    await this.em.transactional(async (em) => {
      await this.walletRepository.save(wallet, em);
      if (ledgerEntry) {
        await this.walletRepository.saveLedger(ledgerEntry, em);
      }
    });

    return {
      id: wallet.id,
      playerId: wallet.playerId,
      balance: wallet.balance.toJSON(),
      version: wallet.version,
    };
  }
}
