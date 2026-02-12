"use client";

import { useEffect, useState } from "react";

const lines = [
  { prompt: true, text: "sfdx plugins:install @salesforce/sfdx-scanner" },
  { prompt: false, text: "> Installing plugin @salesforce/sfdx-scanner... installed v3.0.0" },
  { prompt: true, text: 'sfdx hub:explore --category="lwc"' },
  { prompt: false, text: "> Found 24 components matching your criteria" },
];

export function TerminalAnimation() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines >= lines.length) return;
    const timer = setTimeout(
      () => setVisibleLines((v) => v + 1),
      visibleLines === 0 ? 600 : 800
    );
    return () => clearTimeout(timer);
  }, [visibleLines]);

  return (
    <div className="max-w-[600px] mx-auto mt-12">
      <div className="code-block p-4 text-left">
        {lines.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className="opacity-0 animate-fade-in"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            {line.prompt ? (
              <span>
                <span className="text-accent-pink mr-2">&#10148;</span>
                <span className="text-primary">{line.text}</span>
              </span>
            ) : (
              <span className="text-text-muted/60 mt-1 block">{line.text}</span>
            )}
          </div>
        ))}
        {visibleLines < lines.length && (
          <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
        )}
      </div>
    </div>
  );
}
