import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, count } from "drizzle-orm";
import { updateUserSchema } from "@/lib/validators";
import {
  sendUserSuspendedEmail,
  sendUserBannedEmail,
  sendUserRestoredEmail,
} from "@/lib/email";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { role, status } = parsed.data;

    if (!role && !status) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Can't change own role or status
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot change your own role or status" },
        { status: 400 }
      );
    }

    // Fetch target user
    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Last admin protection for role demotion
    if (role && role !== "admin" && targetUser.role === "admin") {
      const [{ adminCount }] = await db
        .select({ adminCount: count() })
        .from(users)
        .where(eq(users.role, "admin"));
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot demote the last admin" },
          { status: 400 }
        );
      }
    }

    // Last active admin protection for status change
    if (status && status !== "active" && targetUser.role === "admin" && targetUser.status === "active") {
      const [{ activeAdminCount }] = await db
        .select({ activeAdminCount: count() })
        .from(users)
        .where(and(eq(users.role, "admin"), eq(users.status, "active")));
      if (activeAdminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot suspend/ban the last active admin" },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, string> = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
      });

    // Fire-and-forget emails on status change
    if (status && status !== targetUser.status) {
      const userName = targetUser.name || "";
      const email = targetUser.email;
      if (status === "suspended") {
        void sendUserSuspendedEmail(email, userName);
      } else if (status === "banned") {
        void sendUserBannedEmail(email, userName);
      } else if (status === "active") {
        void sendUserRestoredEmail(email, userName);
      }
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
