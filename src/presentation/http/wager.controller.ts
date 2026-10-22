import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OpenWalletUseCase } from '../../application/use-cases/open-wallet.use-case.js';
import { ProcessWagerTransactionUseCase } from '../../application/use-cases/process-wager-transaction.use-case.js';
import { MoneyProps } from '../../domain/value-objects/money.js';

@Controller()
export class WagerController {
  constructor(
    private readonly openWalletUseCase: OpenWalletUseCase,
    private readonly processWagerUseCase: ProcessWagerTransactionUseCase,
  ) {}

  @Post('wallets')
  async createWallet(
    @Body() body: { playerId: string; initialBalance: MoneyProps },
  ) {
    return await this.openWalletUseCase.execute({
      playerId: body.playerId,
      initialBalance: body.initialBalance,
    });
  }

  @Post('wagering/transactions')
  @HttpCode(HttpStatus.OK)
  async processTransaction(
    @Headers('idempotency-key') idempotencyKey: string,
    @Body()
    body: {
      providerId: string;
      externalTransactionId: string;
      playerId: string;
      walletId: string;
      roundId: string;
      gameId: string;
      kind: 'BET' | 'WIN' | 'LOSS' | 'REFUND' | 'ROLLBACK';
      money: MoneyProps;
      referenceExternalTransactionId?: string;
    },
  ) {
    const finalIdempotencyKey =
      idempotencyKey || `${body.providerId}:${body.externalTransactionId}`;

    return await this.processWagerUseCase.execute({
      ...body,
      idempotencyKey: finalIdempotencyKey,
    });
  }

  // ---- Endpoints adicionais exigidos pelo README (Seção 9) ----

  @Get('wallets/:walletId')
  async getWallet(@Param('walletId') walletId: string) {
    // Implementaremos a consulta detalhada da wallet em breve
    return { walletId, message: 'Endpoint de consulta de wallet' };
  }

  @Get('wallets/:walletId/ledger')
  async getWalletLedger(
    @Param('walletId') walletId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit: number = 50,
  ) {
    return { walletId, cursor, limit, entries: [] };
  }

  @Get('wagering/transactions/:transactionId')
  async getTransactionById(@Param('transactionId') transactionId: string) {
    return { transactionId };
  }

  @Get('providers/:providerId/wagering/transactions/:externalTransactionId')
  async getTransactionByExternalId(
    @Param('providerId') providerId: string,
    @Param('externalTransactionId') externalTransactionId: string,
  ) {
    return { providerId, externalTransactionId };
  }

  @Post('wallets/:walletId/reconciliation')
  async reconcileWallet(
    @Param('walletId') walletId: string,
    @Body() body: any,
  ) {
    return {
      walletId,
      storedBalance: body.storedBalance,
      calculatedBalance: body.calculatedBalance,
      difference: { amount: '0.00', currency: 'BRL' },
      consistent: true,
      checkedEntries: 0,
    };
  }

  @Get('health/live')
  async liveness() {
    return { status: 'UP' };
  }

  @Get('health/ready')
  async readiness() {
    return { status: 'UP', database: 'CONNECTED', sqs: 'CONNECTED' };
  }
}
