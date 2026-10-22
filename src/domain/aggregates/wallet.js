"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
class Wallet {
    id;
    playerId;
    currency;
    _balance;
    _version;
    createdAt;
    _updatedAt;
    constructor(id, playerId, currency, _balance, _version, createdAt, _updatedAt) {
        this.id = id;
        this.playerId = playerId;
        this.currency = currency;
        this._balance = _balance;
        this._version = _version;
        this.createdAt = createdAt;
        this._updatedAt = _updatedAt;
    }
    static open(props) {
        const now = new Date();
        return new Wallet(props.id, props.playerId, props.initialBalance.currency, props.initialBalance, 1, // version inicia em 1
        now, now);
    }
    static rehydrate(state) {
        return new Wallet(state.id, state.playerId, state.currency, state.balance, state.version, state.createdAt, state.updatedAt);
    }
    get balance() {
        return this._balance;
    }
    get version() {
        return this._version;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    assertSameCurrency(money) {
        if (this.currency !== money.currency) {
            throw new Error(`Currency mismatch in wallet: wallet is ${this.currency}, operation is ${money.currency}`);
        }
    }
    credit(amount, at = new Date()) {
        this.assertSameCurrency(amount);
        if (!amount.isPositive()) {
            throw new Error('Credit amount must be positive.');
        }
        this._balance = this._balance.add(amount);
        this._version += 1;
        this._updatedAt = at;
    }
    debit(amount, at = new Date()) {
        this.assertSameCurrency(amount);
        if (!amount.isPositive()) {
            throw new Error('Debit amount must be positive.');
        }
        if (this._balance.isLessThan(amount)) {
            throw new Error('Insufficient funds for debit.');
        }
        this._balance = this._balance.subtract(amount);
        this._version += 1;
        this._updatedAt = at;
    }
}
exports.Wallet = Wallet;
