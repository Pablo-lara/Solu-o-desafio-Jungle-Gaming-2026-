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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenWalletUseCase = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@mikro-orm/core");
const wallet_js_1 = require("../../domain/aggregates/wallet.js");
const money_js_1 = require("../../domain/value-objects/money.js");
const wallet_ledger_entry_js_1 = require("../../domain/aggregates/wallet-ledger-entry.js");
const wallet_repository_js_1 = require("../../shared/infrastructure/database/repositories/wallet.repository.js");
let OpenWalletUseCase = class OpenWalletUseCase {
    walletRepository;
    em;
    constructor(walletRepository, em) {
        this.walletRepository = walletRepository;
        this.em = em;
    }
    async execute(input) {
        const initialMoney = money_js_1.Money.from(input.initialBalance);
        const walletId = crypto.randomUUID();
        const wallet = wallet_js_1.Wallet.open({
            id: walletId,
            playerId: input.playerId,
            initialBalance: initialMoney,
        });
        let ledgerEntry;
        if (initialMoney.isPositive()) {
            ledgerEntry = wallet_ledger_entry_js_1.WalletLedgerEntry.create({
                id: crypto.randomUUID(),
                walletId: wallet.id,
                transactionId: crypto.randomUUID(),
                direction: wallet_ledger_entry_js_1.LedgerDirection.Credit,
                money: initialMoney,
                balanceBefore: money_js_1.Money.zero(initialMoney.currency),
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
};
exports.OpenWalletUseCase = OpenWalletUseCase;
exports.OpenWalletUseCase = OpenWalletUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [wallet_repository_js_1.WalletRepository,
        core_1.EntityManager])
], OpenWalletUseCase);
