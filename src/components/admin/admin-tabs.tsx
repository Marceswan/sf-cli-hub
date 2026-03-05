"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Inbox, Database, Tag, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox },
  { href: "/admin/resources", label: "Resources", icon: Database },
  { href: "/admin/tags", label: "Tags", icon: Tag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-border pb-px overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      {adminNav.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors rounded-t-lg -mb-px whitespace-nowrap",
              isActive
                ? "text-primary border-b-2 border-primary"
                : "text-text-muted hover:text-text-main"
            )}
          >
            <Icon size={16} className="shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
