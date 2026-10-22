import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { InboxRepository } from '../database/repositories/inbox.repository.js';
import { ProcessWagerTransactionUseCase } from '../../../application/use-cases/process-wager-transaction.use-case.js';
import { InboxMessageEntity } from '../database/entities/inbox-message.entity.js';

@Injectable()
export class SqsWagerConsumer {
  private readonly logger = new Logger(SqsWagerConsumer.name);
  private readonly consumerName = 'wager-transactions-consumer';

  constructor(
    private readonly em: EntityManager,
    private readonly inboxRepository: InboxRepository,
    private readonly processWagerUseCase: ProcessWagerTransactionUseCase,
  ) {}

  /**
   * Método simulado que seria acionado pelo listener do AWS SQS
   */
  async handleMessage(sqsMessage: { messageId: string; data: any }) {
    const { messageId, data } = sqsMessage;

    // Executa tudo dentro de uma transação atômica do banco de dados
    await this.em.transactional(async (em: EntityManager) => {
      // 1. Verifica se a mensagem já existe no Inbox (Deduplicação)
      const existingInbox = await this.inboxRepository.findByMessageAndConsumer(
        messageId,
        this.consumerName,
        em,
      );

      if (existingInbox && existingInbox.processedAt) {
        this.logger.warn(
          `Mensagem [${messageId}] duplicada detetada no Inbox. Ignorando.`,
        );
        return;
      }

      // 2. Se não existir, regista no inbox
      if (!existingInbox) {
        await this.inboxRepository.save(
          {
            messageId,
            consumerName: this.consumerName,
            payloadHash: JSON.stringify(data), // Idealmente um hash real do payload
          },
          em,
        );
      }

      // 3. Reutiliza exatamente o mesmo caso de uso da API HTTP
      await this.processWagerUseCase.execute({
        providerId: data.providerId,
        externalTransactionId: data.externalTransactionId,
        idempotencyKey: data.idempotencyKey,
        playerId: data.playerId,
        walletId: data.walletId,
        roundId: data.roundId,
        gameId: data.gameId,
        kind: data.kind,
        money: data.money,
      });

      // 4. Atualiza o inbox marcando como processado
      const inboxEntity = await em.findOne(InboxMessageEntity, {
        messageId,
        consumerName: this.consumerName,
      });
      if (inboxEntity) {
        inboxEntity.processedAt = new Date();
        em.persist(inboxEntity);
      }
    });

    this.logger.log(
      `Mensagem SQS [${messageId}] processada com sucesso via Inbox.`,
    );
  }
}
