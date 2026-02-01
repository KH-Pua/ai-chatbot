import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

export default defineConfig({
  // Database dialect
  dialect: 'postgresql',
  
  // Schema files location
  schema: './lib/db/schema.ts',
  
  // Output folder for migrations
  out: './drizzle',
  
  // Database credentials
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  
  // Verbose logging
  verbose: true,
  
  // Strict mode for better error handling
  strict: true,
});