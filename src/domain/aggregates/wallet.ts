import { Money } from '../value-objects/money.js';

export interface WalletState {
  id: string;
  playerId: string;
  currency: string;
  balance: Money;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Wallet {
  private constructor(
    public readonly id: string,
    public readonly playerId: string,
    public readonly currency: string,
    private _balance: Money,
    private _version: number,
    public readonly createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static open(props: {
    id: string;
    playerId: string;
    initialBalance: Money;
  }): Wallet {
    const now = new Date();
    return new Wallet(
      props.id,
      props.playerId,
      props.initialBalance.currency,
      props.initialBalance,
      1, // version inicia em 1
      now,
      now,
    );
  }

  static rehydrate(state: WalletState): Wallet {
    return new Wallet(
      state.id,
      state.playerId,
      state.currency,
      state.balance,
      state.version,
      state.createdAt,
      state.updatedAt,
    );
  }

  get balance(): Money {
    return this._balance;
  }

  get version(): number {
    return this._version;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  private assertSameCurrency(money: Money): void {
    if (this.currency !== money.currency) {
      throw new Error(
        `Currency mismatch in wallet: wallet is ${this.currency}, operation is ${money.currency}`,
      );
    }
  }

  credit(amount: Money, at: Date = new Date()): void {
    this.assertSameCurrency(amount);
    if (!amount.isPositive()) {
      throw new Error('Credit amount must be positive.');
    }
    this._balance = this._balance.add(amount);
    this._version += 1;
    this._updatedAt = at;
  }

  debit(amount: Money, at: Date = new Date()): void {
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
