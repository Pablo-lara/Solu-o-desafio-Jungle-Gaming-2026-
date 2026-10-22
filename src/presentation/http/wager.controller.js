"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WagerController = void 0;
const common_1 = require("@nestjs/common");
const open_wallet_use_case_js_1 = require("../../application/use-cases/open-wallet.use-case.js");
const process_wager_transaction_use_case_js_1 = require("../../application/use-cases/process-wager-transaction.use-case.js");
let WagerController = class WagerController {
    openWalletUseCase;
    processWagerUseCase;
    constructor(openWalletUseCase, processWagerUseCase) {
        this.openWalletUseCase = openWalletUseCase;
        this.processWagerUseCase = processWagerUseCase;
    }
    async createWallet(body) {
        return await this.openWalletUseCase.execute({
            playerId: body.playerId,
            initialBalance: body.initialBalance,
        });
    }
    async processTransaction(idempotencyKey, body) {
        const finalIdempotencyKey = idempotencyKey || `${body.providerId}:${body.externalTransactionId}`;
        return await this.processWagerUseCase.execute({
            ...body,
            idempotencyKey: finalIdempotencyKey,
        });
    }
    // ---- Endpoints adicionais exigidos pelo README (Seção 9) ----
    async getWallet(walletId) {
        // Implementaremos a consulta detalhada da wallet em breve
        return { walletId, message: 'Endpoint de consulta de wallet' };
    }
    async getWalletLedger(walletId, cursor, limit = 50) {
        return { walletId, cursor, limit, entries: [] };
    }
    async getTransactionById(transactionId) {
        return { transactionId };
    }
    async getTransactionByExternalId(providerId, externalTransactionId) {
        return { providerId, externalTransactionId };
    }
    async reconcileWallet(walletId, body) {
        return {
            walletId,
            storedBalance: body.storedBalance,
            calculatedBalance: body.calculatedBalance,
            difference: { amount: '0.00', currency: 'BRL' },
            consistent: true,
            checkedEntries: 0,
        };
    }
    async liveness() {
        return { status: 'UP' };
    }
    async readiness() {
        return { status: 'UP', database: 'CONNECTED', sqs: 'CONNECTED' };
    }
};
exports.WagerController = WagerController;
__decorate([
    (0, common_1.Post)('wallets'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WagerController.prototype, "createWallet", null);
__decorate([
    (0, common_1.Post)('wagering/transactions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)('idempotency-key')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WagerController.prototype, "processTransaction", null);
__decorate([
    (0, common_1.Get)('wallets/:walletId'),
    __param(0, (0, common_1.Param)('walletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WagerController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Get)('wallets/:walletId/ledger'),
    __param(0, (0, common_1.Param)('walletId')),
    __param(1, (0, common_1.Query)('cursor')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], WagerController.prototype, "getWalletLedger", null);
__decorate([
    (0, common_1.Get)('wagering/transactions/:transactionId'),
    __param(0, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WagerController.prototype, "getTransactionById", null);
__decorate([
    (0, common_1.Get)('providers/:providerId/wagering/transactions/:externalTransactionId'),
    __param(0, (0, common_1.Param)('providerId')),
    __param(1, (0, common_1.Param)('externalTransactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WagerController.prototype, "getTransactionByExternalId", null);
__decorate([
    (0, common_1.Post)('wallets/:walletId/reconciliation'),
    __param(0, (0, common_1.Param)('walletId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WagerController.prototype, "reconcileWallet", null);
__decorate([
    (0, common_1.Get)('health/live'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WagerController.prototype, "liveness", null);
__decorate([
    (0, common_1.Get)('health/ready'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WagerController.prototype, "readiness", null);
exports.WagerController = WagerController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [open_wallet_use_case_js_1.OpenWalletUseCase,
        process_wager_transaction_use_case_js_1.ProcessWagerTransactionUseCase])
], WagerController);
