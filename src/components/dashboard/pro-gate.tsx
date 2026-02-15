"use client";

import { Lock } from "lucide-react";
import Link from "next/link";

interface ProGateProps {
  locked: boolean;
  feature: string;
  children: React.ReactNode;
}

export function ProGate({ locked, feature, children }: ProGateProps) {
  if (!locked) return <>{children}</>;

  return (
    <div className="relative">
      <div className="blur-[8px] pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-bg-surface border border-border flex items-center justify-center">
          <Lock className="text-text-muted" size={20} />
        </div>
        <p className="text-sm font-medium text-text-main">
          Unlock {feature}
        </p>
        <Link
          href="/settings/billing"
          className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Upgrade to Pro
        </Link>
      </div>
    </div>
  );
}
