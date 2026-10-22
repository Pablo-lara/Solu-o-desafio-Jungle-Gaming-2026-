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
exports.WalletRepository = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@mikro-orm/core");
const wallet_entity_js_1 = require("../entities/wallet.entity.js");
const wallet_ledger_entry_entity_js_1 = require("../entities/wallet-ledger-entry.entity.js");
const money_js_1 = require("../../../../domain/value-objects/money.js");
let WalletRepository = class WalletRepository {
    em;
    constructor(em) {
        this.em = em;
    }
    async save(wallet, em = this.em) {
        const entity = em.create(wallet_entity_js_1.WalletEntity, {
            id: wallet.id,
            playerId: wallet.playerId,
            currency: wallet.currency,
            balanceAmount: wallet.balance.toJSON().amount,
            version: wallet.version,
            createdAt: wallet.createdAt,
            updatedAt: wallet.updatedAt,
        });
        await em.persist(entity);
    }
    async update(wallet, em = this.em) {
        const entity = await em.findOne(wallet_entity_js_1.WalletEntity, { id: wallet.id });
        if (!entity) {
            throw new Error('Wallet entity not found for update.');
        }
        entity.balanceAmount = wallet.balance.toJSON().amount;
        entity.version = wallet.version;
        entity.updatedAt = wallet.updatedAt;
        await em.persist(entity);
    }
    async findByIdWithLock(walletId, em = this.em) {
        const connection = em.getConnection();
        const knex = connection.getKnex
            ? connection.getKnex()
            : connection.getBuilder();
        const rawWallet = await knex('wallets')
            .where({ id: walletId })
            .forUpdate()
            .first();
        if (!rawWallet) {
            return null;
        }
        return {
            id: rawWallet.id,
            playerId: rawWallet.player_id,
            currency: rawWallet.currency,
            balance: money_js_1.Money.from({
                amount: rawWallet.balance_amount,
                currency: rawWallet.currency,
            }),
            version: rawWallet.version,
            createdAt: new Date(rawWallet.created_at),
            updatedAt: new Date(rawWallet.updated_at),
        };
    }
    async saveLedger(entry, em = this.em) {
        const ledgerEntity = em.create(wallet_ledger_entry_entity_js_1.WalletLedgerEntryEntity, {
            id: entry.id,
            walletId: entry.walletId,
            transactionId: entry.transactionId,
            direction: entry.direction,
            moneyAmount: entry.money.toJSON().amount,
            currency: entry.money.currency,
            balanceBefore: entry.balanceBefore.toJSON().amount,
            balanceAfter: entry.balanceAfter.toJSON().amount,
            createdAt: entry.createdAt,
        });
        await em.persist(ledgerEntity);
    }
};
exports.WalletRepository = WalletRepository;
exports.WalletRepository = WalletRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.EntityManager])
], WalletRepository);
