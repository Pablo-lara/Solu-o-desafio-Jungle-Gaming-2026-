"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessWagerTransactionUseCase = void 0;
const money_js_1 = require("../../domain/value-objects/money.js");
const wallet_js_1 = require("../../domain/aggregates/wallet.js");
const wallet_ledger_entry_js_1 = require("../../domain/aggregates/wallet-ledger-entry.js");
class ProcessWagerTransactionUseCase {
    walletRepository;
    transactionRepository;
    em;
    constructor(walletRepository, transactionRepository, em) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.em = em;
    }
    async execute(input) {
        // 1. Validar Idempotência persistente (verificar se a key já foi processada)
        const existingTransaction = await this.transactionRepository.findByIdempotencyKey(input.idempotencyKey);
        if (existingTransaction) {
            // Se já existe com o mesmo payload, retorna replay idempotente
            return {
                transactionId: existingTransaction.id,
                status: existingTransaction.status,
                idempotentReplay: true,
            };
        }
        const money = money_js_1.Money.from(input.money);
        // 2. Executar dentro de transação atômica protegida contra concorrência (Hot Wallet)
        return await this.em.transactional(async (em) => {
            // Buscar wallet aplicando lock para evitar lost updates (ex: FOR UPDATE)
            const walletState = await this.walletRepository.findByIdWithLock(input.walletId, em);
            if (!walletState) {
                throw new Error('Wallet not found.');
            }
            const wallet = wallet_js_1.Wallet.rehydrate(walletState);
            // Aplicar regra de negócio de acordo com o kind (BET, WIN, etc.)
            let ledgerEntry;
            if (input.kind === 'BET') {
                wallet.debit(money);
                ledgerEntry = wallet_ledger_entry_js_1.WalletLedgerEntry.create({
                    id: crypto.randomUUID(),
                    walletId: wallet.id,
                    transactionId: crypto.randomUUID(),
                    direction: wallet_ledger_entry_js_1.LedgerDirection.Debit,
                    money,
                    balanceBefore: walletState.balance, // saldo antes
                    balanceAfter: wallet.balance, // saldo após
                });
            }
            else if (input.kind === 'WIN' || input.kind === 'REFUND') {
                wallet.credit(money);
                ledgerEntry = wallet_ledger_entry_js_1.WalletLedgerEntry.create({
                    id: crypto.randomUUID(),
                    walletId: wallet.id,
                    transactionId: crypto.randomUUID(),
                    direction: wallet_ledger_entry_js_1.LedgerDirection.Credit,
                    money,
                    balanceBefore: walletState.balance,
                    balanceAfter: wallet.balance,
                });
            }
            // LOSS e ROLLBACK teremos tratamento refinado nas próximas etapas.
            // Salvar atualizações da wallet e registrar o ledger na mesma transação SQL
            await this.walletRepository.update(wallet, em);
            if (ledgerEntry) {
                await this.walletRepository.saveLedger(ledgerEntry, em);
            }
            return {
                transactionId: crypto.randomUUID(),
                status: 'PROCESSED',
                balance: wallet.balance.toJSON(),
                idempotentReplay: false,
            };
        });
    }
}
exports.ProcessWagerTransactionUseCase = ProcessWagerTransactionUseCase;
