import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

// During build, DATABASE_URL may not be set. We create a dummy connection
// that will throw on actual use but allows module resolution to proceed.
const sql = databaseUrl
  ? neon(databaseUrl)
  : ((() => { throw new Error("DATABASE_URL not configured"); }) as unknown as ReturnType<typeof neon>);

export const db = drizzle(sql, { schema });
