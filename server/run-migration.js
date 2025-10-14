import fs from "fs";
import path from "path";
import pool from "./db.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    const migrationPath = path.join(
      __dirname,
      "migrations",
      "add_status_to_email_verifications.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("Running migration: add_status_to_email_verifications.sql");

    await pool.query(migrationSQL);

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
