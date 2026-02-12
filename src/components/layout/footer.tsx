import Link from "next/link";
import { Rss } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="font-extrabold text-xl flex items-center gap-2 mb-3"
            >
              <Rss className="text-primary" size={22} strokeWidth={2.5} />
              SFDX<span className="gradient-text">Hub</span>
            </Link>
            <p className="text-sm text-text-muted">
              The community-driven registry for Salesforce developer tools.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Categories</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link href="/browse?category=cli-plugins" className="hover:text-primary transition-colors">
                  CLI Plugins
                </Link>
              </li>
              <li>
                <Link href="/browse?category=lwc-library" className="hover:text-primary transition-colors">
                  LWC Library
                </Link>
              </li>
              <li>
                <Link href="/browse?category=apex-utilities" className="hover:text-primary transition-colors">
                  Apex Utilities
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Community</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link href="/submit" className="hover:text-primary transition-colors">
                  Submit a Tool
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:text-primary transition-colors">
                  Browse All
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <span className="cursor-default">Privacy Policy</span>
              </li>
              <li>
                <span className="cursor-default">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 text-center text-sm text-text-muted space-y-1">
          <p>&copy; {new Date().getFullYear()} SFDX Hub. Not affiliated with Salesforce, Inc.</p>
          <p>Made with <span className="text-red-500">&hearts;</span> by Swan Media Co.</p>
        </div>
      </div>
    </footer>
  );
}
