import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Use real URL at runtime, placeholder at build time.
// The placeholder creates a valid Drizzle PgDatabase instance
// (required for Auth.js adapter type detection) but will throw
// if any actual query is executed during build.
const sql = neon(
  process.env.DATABASE_URL || "postgresql://placeholder:placeholder@placeholder/placeholder"
);

export const db = drizzle(sql, { schema });
