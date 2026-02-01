import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Database instance configured for PostgreSQL
 * 
 * For local development with Laragon PostgreSQL
 */
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// Export all schema tables and types for easy access
export * from './schema';