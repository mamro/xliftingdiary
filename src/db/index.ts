import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { schemaRelations } from './schema';

export const db = drizzle(process.env.DATABASE_URL!, {
  relations: schemaRelations,
});
