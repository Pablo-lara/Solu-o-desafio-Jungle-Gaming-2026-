import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EntityManager } from '@mikro-orm/core';
import { OutboxMessageEntity } from '../database/entities/outbox-message.entity.js';

@Injectable()
export class OutboxWorker {
  private readonly logger = new Logger(OutboxWorker.name);
  private isProcessing = false;

  constructor(private readonly em: EntityManager) {}

  // Roda a cada 5 segundos (ou ajuste conforme necessário)
  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleOutboxMessages() {
    if (this.isProcessing) {
      return; // Evita concorrência de instâncias/execuções simultâneas do worker
    }

    this.isProcessing = true;

    try {
      // Cria um fork do EntityManager para gerir o ciclo de vida da transação em background
      const em = this.em.fork();

      // Busca um lote de mensagens pendentes que já podem ser retentadas
      const now = new Date();
      const messages = await em.find(
        OutboxMessageEntity,
        {
          publishedAt: { $eq: null },
          $or: [
            { nextTestAttemptAt: { $eq: null } },
            { nextTestAttemptAt: { $lte: now } },
          ],
        },
        {
          limit: 50,
          orderBy: { occurredAt: 'ASC' },
        },
      );

      if (messages.length === 0) {
        return;
      }

      for (const message of messages) {
        try {
          // TODO: Integrar aqui o envio real para o AWS SQS (ex: SqsService ou AWS SDK)
          this.logger.log(
            `A publicar evento outbox [${message.id}] do tipo ${message.eventType}...`,
          );

          // Simulação de envio com sucesso ao SQS
          // await this.sqsService.send(message.payload);

          // Marca como publicado
          message.publishedAt = new Date();
          message.attempts += 1;

          await em.persistAndFlush(message);
          this.logger.log(
            `Evento outbox [${message.id}] publicado com sucesso.`,
          );
        } catch (error) {
          // Em caso de falha no SQS, aplica backoff exponencial simples
          message.attempts += 1;
          const backoffMinutes = Math.pow(2, message.attempts); // 2m, 4m, 8m...
          message.nextTestAttemptAt = new Date(
            Date.now() + backoffMinutes * 60 * 1000,
          );

          await em.persistAndFlush(message);
          this.logger.error(
            `Falha ao publicar evento outbox [${message.id}]: ${(error as Error).message}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Erro crítico no OutboxWorker: ${(error as Error).message}`,
      );
    } finally {
      this.isProcessing = false;
    }
  }
}
