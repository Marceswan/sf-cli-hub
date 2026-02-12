"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TerminalAnimation } from "./terminal-animation";
import { useGsapEntrance } from "@/hooks/use-gsap";

export function HeroSection() {
  const contentRef = useGsapEntrance({
    y: 30,
    stagger: 0.12,
    delay: 0.1,
    childSelector: "[data-animate]",
  });

  return (
    <section className="relative pt-28 pb-20 text-center overflow-hidden hero-glow border-b border-border">
      <div ref={contentRef} className="relative z-10 max-w-[1200px] mx-auto px-6">
        {/* Badges */}
        <div data-animate className="flex justify-center gap-3 mb-6">
          <Badge>v2.4.0 Released</Badge>
          <Badge>Open Source</Badge>
        </div>

        {/* Heading */}
        <h1 data-animate className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
          Supercharge your <br />
          <span className="gradient-text">Salesforce Workflow</span>
        </h1>

        {/* Subtitle */}
        <p data-animate className="text-lg sm:text-xl text-text-muted max-w-[600px] mx-auto mb-10">
          The community-driven registry for high-performance CLI plugins,
          reusable Lightning Web Components, and Apex utilities.
        </p>

        {/* CTA Buttons */}
        <div data-animate className="flex justify-center gap-4 flex-wrap">
          <Link href="/browse">
            <Button variant="primary" size="md">
              Browse Tools
            </Button>
          </Link>
          <Link href="/submit">
            <Button variant="secondary" size="md">
              Submit Resource
            </Button>
          </Link>
        </div>

        {/* Terminal */}
        <div data-animate>
          <TerminalAnimation />
        </div>
      </div>
    </section>
  );
}
