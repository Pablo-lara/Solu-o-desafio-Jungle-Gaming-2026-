import {
  Module,
  OnModuleInit,
  NestModule,
  MiddlewareConsumer,
} from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core'; // <- Importar o MikroORM
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { WagerModule } from './wager.module.js';
import { ProcessWagerTransactionUseCase } from './application/use-cases/process-wager-transaction.use-case.js';
import { WalletRepository } from './shared/infrastructure/database/repositories/wallet.repository.js';
import { IdempotencyKeyRepository } from './shared/infrastructure/database/repositories/idempotency-key.repository.js';
import { CorrelationIdMiddleware } from './presentation/http/middlewares/correlation-id.middleware.js';
import { WalletLedgerEntryEntity } from './shared/infrastructure/database/entities/wallet-ledger-entry.entity.js';
import { OutboxMessageEntity } from './shared/infrastructure/database/entities/outbox-message.entity.js';
import { WalletEntity } from './shared/infrastructure/database/entities/wallet.entity.js';
import { IdempotencyKeyEntity } from './shared/infrastructure/database/entities/idempotency-key.entity.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    MikroOrmModule.forRoot({
      type: 'postgresql',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      dbName: process.env.DB_NAME ?? 'wager_service',
      entities: [
        WalletEntity,
        WalletLedgerEntryEntity,
        IdempotencyKeyEntity,
        OutboxMessageEntity,
      ],
      debug: process.env.NODE_ENV !== 'production',
    }),
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'projeto - Jungle Gaming',
    }),
    WagerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(private readonly mikroOrm: MikroORM) {}

  // 1. Configuração do Middleware de Correlation ID para todas as rotas
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }

  // 2. Inicialização do banco de dados ao subir a aplicação
  async onModuleInit() {
    // Boas práticas: Em produção, o ideal é rodar via CLI de migrations.
    // Mantemos o updateSchema() ativo em desenvolvimento/testes para facilitar.
    if (process.env.NODE_ENV !== 'production') {
      const generator = this.mikroOrm.getSchemaGenerator();
      await generator.updateSchema();
    }
  }
}
