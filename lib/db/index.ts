import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import { resources } from "./schema/resources";
import { users } from "./schema/users";
import { embeddings } from "./schema/embeddings";
// Use require instead of import for postgres to avoid Cloudflare-specific imports
const postgres = require("postgres");
import { env } from "@/lib/env.mjs";
import * as schema from "./schema";

// Connect to the database with a secure postgres connection string
const dbUrl = env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL is not defined");
}

// Connect to the database with a secure postgres connection string
const client = postgres(`${dbUrl}${dbUrl.includes("?") ? "&" : "?"}sslmode=require`);

// For normal queries
export const db = drizzle(client);

// For queries that need the schema
export const dbWithSchema = drizzle(client, { schema });

