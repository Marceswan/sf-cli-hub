import { requireAdmin } from "@/lib/auth-utils";
import { AdminTabs } from "@/components/admin/admin-tabs";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>

      <AdminTabs />

      <div className="mt-6">{children}</div>
    </div>
  );
}
