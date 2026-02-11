"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface InstallCommandProps {
  command: string;
}

export function InstallCommand({ command }: InstallCommandProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="code-block flex items-center justify-between p-4">
      <code className="text-sm">
        <span className="text-accent-pink mr-2">$</span>
        <span className="text-primary">{command}</span>
      </code>
      <button
        onClick={handleCopy}
        className="text-text-muted hover:text-text-main transition-colors ml-4 cursor-pointer"
        aria-label="Copy command"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}
