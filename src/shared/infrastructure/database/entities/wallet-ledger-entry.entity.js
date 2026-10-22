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
exports.WalletLedgerEntryEntity = void 0;
const core_1 = require("@mikro-orm/core");
let WalletLedgerEntryEntity = class WalletLedgerEntryEntity {
    id;
    walletId;
    transactionId;
    direction; // DEBIT | CREDIT
    moneyAmount;
    currency;
    balanceBefore;
    balanceAfter;
    createdAt = new Date();
};
exports.WalletLedgerEntryEntity = WalletLedgerEntryEntity;
__decorate([
    (0, core_1.PrimaryKey)({ type: 'uuid' }),
    __metadata("design:type", String)
], WalletLedgerEntryEntity.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ type: 'uuid', fieldName: 'wallet_id' }),
    __metadata("design:type", String)
], WalletLedgerEntryEntity.prototype, "walletId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'uuid', fieldName: 'transaction_id' }),
    __metadata("design:type", String)
], WalletLedgerEntryEntity.prototype, "transactionId", void 0);
__decorate([
    (0, core_1.Property)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], WalletLedgerEntryEntity.prototype, "direction", void 0);
__decorate([
    (0, core_1.Property)({
        type: 'numeric',
        precision: 18,
        scale: 2,
        fieldName: 'money_amount',
    }),
    __metadata("design:type", String)
], WalletLedgerEntryEntity.prototype, "moneyAmount", void 0);
__decorate([
    (0, core_1.Property)({ type: 'varchar', length: 3 }),
    __metadata("design:type", String)
], WalletLedgerEntryEntity.prototype, "currency", void 0);
__decorate([
    (0, core_1.Property)({
        type: 'numeric',
        precision: 18,
        scale: 2,
        fieldName: 'balance_before',
    }),
    __metadata("design:type", String)
], WalletLedgerEntryEntity.prototype, "balanceBefore", void 0);
__decorate([
    (0, core_1.Property)({
        type: 'numeric',
        precision: 18,
        scale: 2,
        fieldName: 'balance_after',
    }),
    __metadata("design:type", String)
], WalletLedgerEntryEntity.prototype, "balanceAfter", void 0);
__decorate([
    (0, core_1.Property)({ type: 'timestamptz', fieldName: 'created_at' }),
    __metadata("design:type", Date)
], WalletLedgerEntryEntity.prototype, "createdAt", void 0);
exports.WalletLedgerEntryEntity = WalletLedgerEntryEntity = __decorate([
    (0, core_1.Entity)({ tableName: 'wallet_ledger_entries' }),
    (0, core_1.Index)({ properties: ['walletId'] })
], WalletLedgerEntryEntity);
