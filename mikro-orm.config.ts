import { defineConfig } from '@mikro-orm/postgresql';

export default defineConfig({
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
