import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { tags } from "./schema";
import { slugify } from "../utils";

const TAG_NAMES = [
  "CLI Plugin",
  "LWC",
  "Apex",
  "DevOps",
  "Testing",
  "Data Migration",
  "Security",
  "Metadata",
  "Open Source",
];

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const sql = neon(url);
  const db = drizzle(sql);

  const values = TAG_NAMES.map((name) => ({
    name,
    slug: slugify(name),
  }));

  await db.insert(tags).values(values).onConflictDoNothing();

  console.log(`Seeded ${values.length} tags`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
