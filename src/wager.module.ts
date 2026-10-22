import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ScheduleModule } from '@nestjs/schedule';
import { WagerController } from './presentation/http/wager.controller.js';
import { OpenWalletUseCase } from './application/use-cases/open-wallet.use-case.js';
import { ProcessWagerTransactionUseCase } from './application/use-cases/process-wager-transaction.use-case.js';
import { WalletRepository } from './shared/infrastructure/database/repositories/wallet.repository.js';
import { WalletEntity } from './shared/infrastructure/database/entities/wallet.entity.js';
import { WalletLedgerEntryEntity } from './shared/infrastructure/database/entities/wallet-ledger-entry.entity.js';
import { IdempotencyKeyRepository } from './shared/infrastructure/database/repositories/idempotency-key.repository.js';
import { IdempotencyKeyEntity } from './shared/infrastructure/database/entities/idempotency-key.entity.js';
import { OutboxRepository } from './shared/infrastructure/database/repositories/outbox.repository.js';
import { OutboxMessageEntity } from './shared/infrastructure/database/entities/outbox-message.entity.js'; // <- Importe a entidade Outbox

@Module({
  imports: [
    // 1. O ScheduleModule deve ficar nos imports gerais do módulo, NUNCA dentro do forFeature do MikroORM
    ScheduleModule.forRoot(),

    // 2. Apenas ENTIDADES do MikroORM devem ir dentro do forFeature
    MikroOrmModule.forFeature([
      WalletEntity,
      WalletLedgerEntryEntity,
      IdempotencyKeyEntity,
      OutboxMessageEntity, // <- Adicionada a entidade Outbox em falta
    ]),
  ],
  controllers: [WagerController],
  providers: [
    WalletRepository,
    OpenWalletUseCase,
    ProcessWagerTransactionUseCase,
    IdempotencyKeyRepository,
    OutboxRepository,
  ],
  exports: [WalletRepository, MikroOrmModule], // <- Exporta o MikroOrmModule para que outros módulos possam usar as entidades
})
export class WagerModule {}
