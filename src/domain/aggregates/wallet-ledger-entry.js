"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletLedgerEntry = exports.LedgerDirection = void 0;
var LedgerDirection;
(function (LedgerDirection) {
    LedgerDirection["Debit"] = "DEBIT";
    LedgerDirection["Credit"] = "CREDIT";
})(LedgerDirection || (exports.LedgerDirection = LedgerDirection = {}));
class WalletLedgerEntry {
    id;
    walletId;
    transactionId;
    direction;
    money;
    balanceBefore;
    balanceAfter;
    createdAt;
    constructor(id, walletId, transactionId, direction, money, balanceBefore, balanceAfter, createdAt) {
        this.id = id;
        this.walletId = walletId;
        this.transactionId = transactionId;
        this.direction = direction;
        this.money = money;
        this.balanceBefore = balanceBefore;
        this.balanceAfter = balanceAfter;
        this.createdAt = createdAt;
        this.validateArithmetic();
    }
    static create(props) {
        return new WalletLedgerEntry(props.id, props.walletId, props.transactionId, props.direction, props.money, props.balanceBefore, props.balanceAfter, props.createdAt || new Date());
    }
    validateArithmetic() {
        let expectedAfter;
        if (this.direction === LedgerDirection.Debit) {
            expectedAfter = this.balanceBefore.subtract(this.money);
        }
        else {
            expectedAfter = this.balanceBefore.add(this.money);
        }
        if (!expectedAfter.equals(this.balanceAfter)) {
            throw new Error('Ledger entry arithmetic mismatch: balanceBefore and balanceAfter do not match the movement amount.');
        }
    }
    isBalanced() {
        try {
            this.validateArithmetic();
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.WalletLedgerEntry = WalletLedgerEntry;
