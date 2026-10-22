import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class PendingReferenceWorker {
  private readonly logger = new Logger(PendingReferenceWorker.name);
  private isProcessing = false;

  constructor(private readonly em: EntityManager) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processPendingReferences() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      const em = this.em.fork();

      // Exemplo conceitual: buscar transações com status PENDING_REFERENCE na base de dados
      // const pendingTransactions = await em.find(WagerTransactionEntity, { status: 'PENDING_REFERENCE' });

      // if (pendingTransactions.length === 0) {
      //   return;
      // }

      // Para cada transação pendente:
      // 1. Verifica se a transação referenciada (referenceExternalTransactionId) já existe e está PROCESSED.
      // 2. Se já existir, muda o status para PROCESSED, aplica o saldo/ledger e remove a pendência.
      // 3. Se ainda não existir e o limite de tentativas não estourou, incrementa as tentativas e aguarda o próximo ciclo.
      // 4. Se estourar o limite (TTL excedido), marca como REJECTED com um failureCode específico (ex: REFERENCE_NOT_FOUND).
    } catch (error: any) {
      this.logger.error(
        `Erro crítico no PendingReferenceWorker: ${error.message}`,
      );
    } finally {
      this.isProcessing = false;
    }
  }
}
