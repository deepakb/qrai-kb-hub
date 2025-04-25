import { db } from "./index";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(".env") });

async function main() {
  console.log("Running users migration...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(191) PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    ALTER TABLE resources
    ADD COLUMN IF NOT EXISTS user_id VARCHAR(191) REFERENCES users(id);
  `);

  console.log("Users migration completed successfully");
}

main().catch((err) => {
  console.error("Migration failed:");
  console.error(err);
  process.exit(1);
});