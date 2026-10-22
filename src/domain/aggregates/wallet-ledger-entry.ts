import { Money } from '../value-objects/money.js';

export enum LedgerDirection {
  Debit = 'DEBIT',
  Credit = 'CREDIT',
}

export interface LedgerEntryProps {
  id: string;
  walletId: string;
  transactionId: string;
  direction: LedgerDirection;
  money: Money;
  balanceBefore: Money;
  balanceAfter: Money;
  createdAt?: Date;
}

export class WalletLedgerEntry {
  private constructor(
    public readonly id: string,
    public readonly walletId: string,
    public readonly transactionId: string,
    public readonly direction: LedgerDirection,
    public readonly money: Money,
    public readonly balanceBefore: Money,
    public readonly balanceAfter: Money,
    public readonly createdAt: Date,
  ) {
    this.validateArithmetic();
  }

  static create(props: LedgerEntryProps): WalletLedgerEntry {
    return new WalletLedgerEntry(
      props.id,
      props.walletId,
      props.transactionId,
      props.direction,
      props.money,
      props.balanceBefore,
      props.balanceAfter,
      props.createdAt || new Date(),
    );
  }

  private validateArithmetic(): void {
    let expectedAfter: Money;
    if (this.direction === LedgerDirection.Debit) {
      expectedAfter = this.balanceBefore.subtract(this.money);
    } else {
      expectedAfter = this.balanceBefore.add(this.money);
    }

    if (!expectedAfter.equals(this.balanceAfter)) {
      throw new Error(
        'Ledger entry arithmetic mismatch: balanceBefore and balanceAfter do not match the movement amount.',
      );
    }
  }

  isBalanced(): boolean {
    try {
      this.validateArithmetic();
      return true;
    } catch {
      return false;
    }
  }
}
