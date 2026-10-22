"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const postgresql_1 = require("@mikro-orm/postgresql");
exports.default = (0, postgresql_1.defineConfig)({
    type: 'postgresql',
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    dbName: 'wager_service',
    entities: ['./src/**/*.entity.ts'],
    entitiesTs: ['./src/**/*.entity.ts'],
    migrations: {
        path: './src/shared/infrastructure/database/migrations',
        pathTs: './src/shared/infrastructure/database/migrations',
        transactional: true,
        allOrNothing: true,
    },
});
