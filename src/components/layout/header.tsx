"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Rss, User, LogOut, Shield } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/browse?category=cli-plugins", label: "CLI Plugins" },
  { href: "/browse?category=lwc-library", label: "LWC Library" },
  { href: "/browse?category=apex-utilities", label: "Apex Utilities" },
  { href: "/browse?category=agentforce", label: "Agentforce" },
  { href: "/browse?category=flow", label: "Flow" },
  { href: "/browse?category=experience-cloud", label: "Experience Cloud" },
];

export function Header() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const user = session?.user;
  const isAdmin = user?.role === "admin";

  return (
    <header className="fixed top-0 w-full z-50 glass border-b border-border">
      <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center h-[70px]">
        {/* Logo */}
        <Link href="/" className="font-extrabold text-2xl flex items-center gap-2">
          <Rss className="text-primary" size={28} strokeWidth={2.5} />
          <span>
            SFDX<span className="gradient-text">Hub</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-text-muted hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-8 h-8 rounded-full bg-bg-surface border border-border flex items-center justify-center text-xs font-bold cursor-pointer hover:border-primary transition-colors"
              >
                {user.name?.[0]?.toUpperCase() || "U"}
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-medium truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text-main hover:bg-bg-surface transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={14} />
                      Profile
                    </Link>
                    <Link
                      href="/submit"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text-main hover:bg-bg-surface transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Submit Tool
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text-main hover:bg-bg-surface transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Shield size={14} />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-muted hover:text-red-500 hover:bg-bg-surface transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-text-muted hover:text-text-main transition-colors"
            >
              Sign In
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden text-text-muted hover:text-text-main cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 border-t border-border",
          mobileOpen ? "max-h-80" : "max-h-0 border-t-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-6 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-2 text-sm font-medium text-text-muted hover:text-primary transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <Link
              href="/login"
              className="py-2 text-sm font-medium text-text-muted hover:text-text-main transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
