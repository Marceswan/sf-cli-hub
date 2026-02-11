import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + "...",
  };

  try {
    // Simple query to test connection
    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    checks.dbConnected = true;
    checks.userCount = result[0]?.count ?? 0;
  } catch (e: unknown) {
    checks.dbConnected = false;
    checks.dbError = e instanceof Error ? e.message : String(e);
    checks.dbErrorName = e instanceof Error ? e.constructor.name : typeof e;
  }

  return NextResponse.json(checks);
}
