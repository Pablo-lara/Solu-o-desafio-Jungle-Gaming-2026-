"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
class Money {
    valueInCents;
    currency;
    constructor(valueInCents, currency) {
        this.valueInCents = valueInCents;
        this.currency = currency;
    }
    static from(props) {
        const { amount, currency } = props;
        if (typeof amount !== 'string' || !amount.trim()) {
            throw new Error('Invalid money amount: must be a non-empty string.');
        }
        // Rejeita notação científica, NaN ou Infinity enviados como string
        if (/e/i.test(amount)) {
            throw new Error(`Invalid money amount format: "${amount}". Scientific notation is not allowed.`);
        }
        // Valida precisão de no máximo 2 casas decimais estritas
        const decimalRegex = /^-?\d+(\.\d{1,2})?$/;
        if (!decimalRegex.test(amount)) {
            throw new Error(`Invalid money amount precision: "${amount}". Must have at most 2 decimal places.`);
        }
        const isNegative = amount.startsWith('-');
        const cleanAmount = isNegative ? amount.substring(1) : amount;
        const parts = cleanAmount.split('.');
        const wholeStr = parts[0];
        let fracStr = parts[1] || '';
        while (fracStr.length < 2) {
            fracStr += '0';
        }
        const wholeBig = BigInt(wholeStr);
        const fracBig = BigInt(fracStr);
        let totalCents = wholeBig * 100n + fracBig;
        if (isNegative) {
            totalCents = -totalCents;
        }
        if (totalCents < 0n) {
            throw new Error('Money amount cannot be negative in input contracts.');
        }
        if (!currency || currency.length !== 3) {
            throw new Error('Invalid currency: must be a valid ISO-4217 3-letter code.');
        }
        return new Money(totalCents, currency.toUpperCase());
    }
    static zero(currency) {
        return new Money(0n, currency.toUpperCase());
    }
    static fromCents(cents, currency) {
        return new Money(cents, currency);
    }
    assertSameCurrency(other) {
        if (this.currency !== other.currency) {
            throw new Error(`Currency mismatch: cannot operate between ${this.currency} and ${other.currency}`);
        }
    }
    add(other) {
        this.assertSameCurrency(other);
        return Money.fromCents(this.valueInCents + other.valueInCents, this.currency);
    }
    subtract(other) {
        this.assertSameCurrency(other);
        const resultCents = this.valueInCents - other.valueInCents;
        if (resultCents < 0n) {
            throw new Error('Resulting money amount cannot be negative.');
        }
        return Money.fromCents(resultCents, this.currency);
    }
    negate() {
        return Money.fromCents(-this.valueInCents, this.currency);
    }
    isZero() {
        return this.valueInCents === 0n;
    }
    isPositive() {
        return this.valueInCents > 0n;
    }
    isNegative() {
        return this.valueInCents < 0n;
    }
    isLessThan(other) {
        this.assertSameCurrency(other);
        return this.valueInCents < other.valueInCents;
    }
    equals(other) {
        return (this.valueInCents === other.valueInCents &&
            this.currency === other.currency);
    }
    toJSON() {
        const sign = this.valueInCents < 0n ? '-' : '';
        const absCents = this.valueInCents < 0n ? -this.valueInCents : this.valueInCents;
        const whole = absCents / 100n;
        const frac = absCents % 100n;
        const fracPadded = frac.toString().padStart(2, '0');
        return {
            amount: `${sign}${whole}.${fracPadded}`,
            currency: this.currency,
        };
    }
    toString() {
        const json = this.toJSON();
        return `${json.amount} ${this.currency}`;
    }
}
exports.Money = Money;
