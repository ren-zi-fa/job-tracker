import "dotenv/config";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './models/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema } as any);

export default db;
