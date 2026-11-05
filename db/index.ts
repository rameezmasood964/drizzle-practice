import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const rawConnectionString = process.env.DATABASE_URL?.trim();

if (!rawConnectionString) {
  throw new Error(
    "DATABASE_URL is missing in .env file. Please check your environment variables.",
  );
}

// Remove surrounding quotes if present
const connectionString = rawConnectionString.replace(/^["']|["']$/g, "");

// Global cache to prevent connection exhaustion during Next.js hot reloads
declare global {
  // eslint-disable-next-line no-var
  var _postgresClient: postgres.Sql | undefined;
}

const client =
  globalThis._postgresClient ??
  postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis._postgresClient = client;
}

export const db = drizzle(client, { schema });
