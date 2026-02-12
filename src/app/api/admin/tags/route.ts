import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tags } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { tagSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = tagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const slug = slugify(parsed.data.name);

    const [tag] = await db
      .insert(tags)
      .values({ name: parsed.data.name, slug })
      .returning();

    return NextResponse.json(tag, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
