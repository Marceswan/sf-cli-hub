import { requireAdmin } from "@/lib/auth-utils";
import { AdminTabs } from "@/components/admin/admin-tabs";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="w-full px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Admin Panel</h1>
      </div>

      <AdminTabs />

      <div className="mt-6">{children}</div>
    </div>
  );
}
