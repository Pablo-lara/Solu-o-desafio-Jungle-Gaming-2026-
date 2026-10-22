"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20261021_Initial = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20261021_Initial extends migrations_1.Migration {
    async up() {
        // Tabela de Wallets com restrições físicas exigidas pelo desafio
        this.addSql(`
      CREATE TABLE "wallets" (
        "id" UUID PRIMARY KEY,
        "player_id" UUID NOT NULL,
        "currency" VARCHAR(3) NOT NULL,
        "balance_amount" NUMERIC(18, 2) NOT NULL,
        "version" INT NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "uq_player_currency" UNIQUE ("player_id", "currency"),
        CONSTRAINT "chk_balance_non_negative" CHECK ("balance_amount" >= 0)
      );
    `);
        // Tabela de Ledger Imutável (sem updates ou deletes)
        this.addSql(`
      CREATE TABLE "wallet_ledger_entries" (
        "id" UUID PRIMARY KEY,
        "wallet_id" UUID NOT NULL,
        "transaction_id" UUID NOT NULL,
        "direction" VARCHAR(10) NOT NULL,
        "money_amount" NUMERIC(18, 2) NOT NULL,
        "currency" VARCHAR(3) NOT NULL,
        "balance_before" NUMERIC(18, 2) NOT NULL,
        "balance_after" NUMERIC(18, 2) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "fk_ledger_wallet" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT
      );
    `);
        this.addSql(`CREATE INDEX "idx_ledger_wallet_id" ON "wallet_ledger_entries" ("wallet_id");`);
    }
    async down() {
        this.addSql(`DROP TABLE IF EXISTS "wallet_ledger_entries";`);
        this.addSql(`DROP TABLE IF EXISTS "wallets";`);
    }
}
exports.Migration20261021_Initial = Migration20261021_Initial;
