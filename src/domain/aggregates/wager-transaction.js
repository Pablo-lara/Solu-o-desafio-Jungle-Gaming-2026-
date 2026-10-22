"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WagerTransaction = exports.WagerTransactionStatus = exports.WagerTransactionKind = void 0;
var WagerTransactionKind;
(function (WagerTransactionKind) {
    WagerTransactionKind["Opening"] = "OPENING";
    WagerTransactionKind["Bet"] = "BET";
    WagerTransactionKind["Win"] = "WIN";
    WagerTransactionKind["Loss"] = "LOSS";
    WagerTransactionKind["Refund"] = "REFUND";
    WagerTransactionKind["Rollback"] = "ROLLBACK";
})(WagerTransactionKind || (exports.WagerTransactionKind = WagerTransactionKind = {}));
var WagerTransactionStatus;
(function (WagerTransactionStatus) {
    WagerTransactionStatus["Pending"] = "PENDING";
    WagerTransactionStatus["PendingReference"] = "PENDING_REFERENCE";
    WagerTransactionStatus["Processed"] = "PROCESSED";
    WagerTransactionStatus["Rejected"] = "REJECTED";
    WagerTransactionStatus["Failed"] = "FAILED";
})(WagerTransactionStatus || (exports.WagerTransactionStatus = WagerTransactionStatus = {}));
class WagerTransaction {
    id;
    providerId;
    externalTransactionId;
    idempotencyKey;
    walletId;
    playerId;
    roundId;
    gameId;
    kind;
    _status;
    constructor(id, providerId, externalTransactionId, idempotencyKey, walletId, playerId, roundId, gameId, kind, _status) {
        this.id = id;
        this.providerId = providerId;
        this.externalTransactionId = externalTransactionId;
        this.idempotencyKey = idempotencyKey;
        this.walletId = walletId;
        this.playerId = playerId;
        this.roundId = roundId;
        this.gameId = gameId;
        this.kind = kind;
        this._status = _status;
    }
    get status() {
        return this._status;
    }
    isTerminal() {
        return (this._status === WagerTransactionStatus.Processed ||
            this._status === WagerTransactionStatus.Rejected ||
            this._status === WagerTransactionStatus.Failed);
    }
}
exports.WagerTransaction = WagerTransaction;
