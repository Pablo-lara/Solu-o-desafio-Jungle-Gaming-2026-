"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WagerModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_1 = require("@mikro-orm/nestjs");
const wager_controller_js_1 = require("./presentation/http/wager.controller.js");
const open_wallet_use_case_js_1 = require("./application/use-cases/open-wallet.use-case.js");
const process_wager_transaction_use_case_js_1 = require("./application/use-cases/process-wager-transaction.use-case.js");
const wallet_repository_js_1 = require("./shared/infrastructure/database/repositories/wallet.repository.js");
const wallet_entity_js_1 = require("./shared/infrastructure/database/entities/wallet.entity.js");
const wallet_ledger_entry_entity_js_1 = require("./shared/infrastructure/database/entities/wallet-ledger-entry.entity.js");
let WagerModule = class WagerModule {
};
exports.WagerModule = WagerModule;
exports.WagerModule = WagerModule = __decorate([
    (0, common_1.Module)({
        imports: [nestjs_1.MikroOrmModule.forFeature([wallet_entity_js_1.WalletEntity, wallet_ledger_entry_entity_js_1.WalletLedgerEntryEntity])],
        controllers: [wager_controller_js_1.WagerController],
        providers: [
            wallet_repository_js_1.WalletRepository,
            open_wallet_use_case_js_1.OpenWalletUseCase,
            process_wager_transaction_use_case_js_1.ProcessWagerTransactionUseCase,
        ],
    })
], WagerModule);
