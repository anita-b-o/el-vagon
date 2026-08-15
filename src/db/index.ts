import "server-only";

import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

neonConfig.webSocketConstructor = ws;

type Database = ReturnType<typeof createDatabase>;

const globalForDatabase = globalThis as typeof globalThis & {
  elVagonDb?: Database;
};

function createDatabase() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL no está configurada.");
  }

  const pool = new Pool({ connectionString });
  return drizzle(pool, { schema });
}

export function getDb(): Database {
  if (!globalForDatabase.elVagonDb) {
    globalForDatabase.elVagonDb = createDatabase();
  }
  return globalForDatabase.elVagonDb;
}

