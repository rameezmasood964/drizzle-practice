
import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString)  {
  throw new Error ("DATABASE_URL is missing in .env file. Please check your environment variables.");
}

// 2. Postgres ka client banana jo database ke sath physical connection open karega
const Client = postgres (connectionString);

// 3. Drizzle ko initialize karna aur schema sath attach kar dena taake poora project use kar sakay
export const db = drizzle(Client, { schema });

