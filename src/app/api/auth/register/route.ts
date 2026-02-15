import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, invitations } from "@/lib/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { registerSchema } from "@/lib/validators";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const inviteToken = body.inviteToken as string | undefined;

    // Check if user already exists
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Check for valid invitation token
    let invitedRole: "user" | "admin" = "user";
    if (inviteToken) {
      const [invite] = await db
        .select()
        .from(invitations)
        .where(
          and(
            eq(invitations.token, inviteToken),
            gt(invitations.expiresAt, new Date()),
            isNull(invitations.acceptedAt)
          )
        )
        .limit(1);

      if (invite) {
        invitedRole = invite.role;
        // Mark invitation as accepted
        await db
          .update(invitations)
          .set({ acceptedAt: new Date() })
          .where(eq(invitations.id, invite.id));
      }
    }

    await db.insert(users).values({
      name,
      email,
      passwordHash,
      role: invitedRole,
    });

    void sendWelcomeEmail(email, name);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
