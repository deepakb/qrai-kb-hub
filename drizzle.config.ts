import type { Config } from "drizzle-kit";
import { env } from "@/lib/env.mjs";
import "dotenv/config";

export default {
  schema: "./lib/db/schema",
  dialect: "postgresql",
  out: "./lib/db/migrations",
  dbCredentials: {
    url: env.DATABASE_URL,
  }
} satisfies Config;