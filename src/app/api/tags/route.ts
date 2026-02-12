import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tags } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const allTags = await db
      .select()
      .from(tags)
      .orderBy(asc(tags.name));

    return NextResponse.json(allTags);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
