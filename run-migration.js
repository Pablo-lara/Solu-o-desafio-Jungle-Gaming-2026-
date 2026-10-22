"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mikro-orm/core");
async function run() {
    console.log('Iniciando conexão com o banco de dados...');
    const orm = await core_1.MikroORM.init({
        type: 'postgresql',
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        dbName: 'wager_service',
        entities: ['./src/**/*.entity.ts'],
        migrations: {
            path: './src/shared/infrastructure/database/migrations',
            pathTs: './src/shared/infrastructure/database/migrations',
            transactional: true,
            allOrNothing: true,
        },
    });
    console.log('Conexão estabelecida. A verificar e executar migrações...');
    const migrator = orm.getMigrator();
    const pending = await migrator.getPendingMigrations();
    console.log(`Migrações pendentes encontradas: ${pending.length}`);
    await migrator.up();
    console.log('Migrações executadas com sucesso! Tabelas criadas no PostgreSQL.');
    await orm.close(true);
}
run().catch((err) => {
    console.error('Erro ao executar migrações:', err);
    process.exit(1);
});
