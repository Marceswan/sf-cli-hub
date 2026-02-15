export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { count } from "drizzle-orm";
import { UserManager } from "./user-manager";

export default async function AdminUsersPage() {
  const [{ total }] = await db.select({ total: count() }).from(users);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">
        Users ({total})
      </h2>
      <UserManager totalUsers={total} />
    </div>
  );
}
