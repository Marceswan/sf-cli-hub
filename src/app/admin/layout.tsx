import Link from "next/link";
import { requireAdmin } from "@/lib/auth-utils";
import { LayoutDashboard, Inbox, Database, Tag, Settings } from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox },
  { href: "/admin/resources", label: "Resources", icon: Database },
  { href: "/admin/tags", label: "Tags", icon: Tag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <nav className="w-48 shrink-0 space-y-1">
          {adminNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-muted hover:text-text-main hover:bg-bg-surface rounded-lg transition-colors"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
