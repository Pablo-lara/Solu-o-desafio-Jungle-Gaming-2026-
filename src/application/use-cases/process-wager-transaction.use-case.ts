import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Money, MoneyProps } from '../../domain/value-objects/money.js';
import { Wallet } from '../../domain/aggregates/wallet.js';
import {
  WalletLedgerEntry,
  LedgerDirection,
} from '../../domain/aggregates/wallet-ledger-entry.js';
import { WalletRepository } from '../../shared/infrastructure/database/repositories/wallet.repository.js';
import { IdempotencyKeyRepository } from '../../shared/infrastructure/database/repositories/idempotency-key.repository.js';
import { OutboxMessageEntity } from '../../shared/infrastructure/database/entities/outbox-message.entity.js';

export interface ProcessWagerInput {
  providerId: string;
  externalTransactionId: string;
  idempotencyKey: string;
  playerId: string;
  walletId: string;
  roundId: string;
  gameId: string;
  kind: 'BET' | 'WIN' | 'LOSS' | 'REFUND' | 'ROLLBACK';
  money: MoneyProps;
  referenceExternalTransactionId?: string;
}

@Injectable()
export class ProcessWagerTransactionUseCase {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly transactionRepository: IdempotencyKeyRepository,
    private readonly em: EntityManager,
  ) {}

  async execute(input: ProcessWagerInput) {
    const money = Money.from(input.money);

    // Executar estritamente dentro de uma transação atômica ACID (Garante consistência e idempotência real)
    return await this.em.transactional(async (em: EntityManager) => {
      // 1. Verificar idempotência DENTRO da transação com bloqueio/consistência de BD
      const existingTransaction =
        await this.transactionRepository.findByIdempotencyKey(
          input.idempotencyKey,
          em,
        );

      if (existingTransaction) {
        // Se já foi processada, retorna o replay idempotente com os dados originais
        return {
          transactionId: existingTransaction.id,
          status: existingTransaction.status,
          balance: existingTransaction.balanceAfter,
          idempotentReplay: true,
        };
      }

      // 2. Buscar wallet aplicando lock (ex: FOR UPDATE) para evitar lost updates em Hot Wallets
      const walletState = await this.walletRepository.findByIdWithLock(
        input.walletId,
        em,
      );
      if (!walletState) {
        throw new Error('Wallet not found.');
      }

      const wallet = Wallet.rehydrate(walletState);
      const transactionId = crypto.randomUUID();
      let ledgerEntry: WalletLedgerEntry | undefined;

      // 3. Aplicar regra de negócio de acordo com o kind
      if (input.kind === 'BET') {
        wallet.debit(money);
        ledgerEntry = WalletLedgerEntry.create({
          id: crypto.randomUUID(),
          walletId: wallet.id,
          transactionId: transactionId,
          direction: LedgerDirection.Debit,
          money,
          balanceBefore: walletState.balance,
          balanceAfter: wallet.balance,
        });
      } else if (input.kind === 'WIN' || input.kind === 'REFUND') {
        wallet.credit(money);
        ledgerEntry = WalletLedgerEntry.create({
          id: crypto.randomUUID(),
          walletId: wallet.id,
          transactionId: transactionId,
          direction: LedgerDirection.Credit,
          money,
          balanceBefore: walletState.balance,
          balanceAfter: wallet.balance,
        });
      }

      // 4. Persistir atualizações da wallet, ledger, transação e Outbox ATOMICAMENTE
      await this.walletRepository.update(wallet, em);
      if (ledgerEntry) {
        await this.walletRepository.saveLedger(ledgerEntry, em);
      }

      // Gravar a transação associada à idempotencyKey na mesma transação SQL
      await this.transactionRepository.save(
        {
          id: transactionId,
          idempotencyKey: input.idempotencyKey,
          providerId: input.providerId,
          externalTransactionId: input.externalTransactionId,
          status: 'PROCESSED',
          balanceAfter: wallet.balance.toJSON().amount,
        },
        em,
      );

      // Gravar evento de integração na Outbox na mesma transação SQL (Garante At-Least-Once sem perda)
      const eventId = crypto.randomUUID();
      const outboxMessage = em.create(OutboxMessageEntity, {
        id: eventId,
        aggregateId: wallet.id,
        eventType: 'WalletBalanceChanged',
        payload: {
          eventId,
          eventType: 'WalletBalanceChanged',
          aggregateId: wallet.id,
          correlationId: input.idempotencyKey,
          occurredAt: new Date().toISOString(),
          version: 1,
          data: {
            walletId: wallet.id,
            transactionId: transactionId,
            direction: ledgerEntry ? ledgerEntry.direction : 'CREDIT',
            money: money.toJSON(),
            balanceBefore: walletState.balance,
            balanceAfter: wallet.balance.toJSON(),
            walletVersion: wallet.version,
          },
        },
        occurredAt: new Date(),
        attempts: 0,
      });
      em.persist(outboxMessage);

      return {
        transactionId: transactionId,
        status: 'PROCESSED',
        balance: wallet.balance.toJSON(),
        idempotentReplay: false,
      };
    });
  }
}
