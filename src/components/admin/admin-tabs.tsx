"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Inbox, Database, Tag, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox },
  { href: "/admin/resources", label: "Resources", icon: Database },
  { href: "/admin/tags", label: "Tags", icon: Tag },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-border pb-px overflow-x-auto">
      {adminNav.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-t-lg -mb-px whitespace-nowrap",
              isActive
                ? "text-primary border-b-2 border-primary"
                : "text-text-muted hover:text-text-main"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
