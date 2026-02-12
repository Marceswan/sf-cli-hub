import { cn } from "@/lib/utils";

interface ContentBandProps {
  variant?: "default" | "filled";
  children: React.ReactNode;
  className?: string;
}

export function ContentBand({
  variant = "default",
  children,
  className,
}: ContentBandProps) {
  return (
    <section
      className={cn(
        "border-t border-border",
        variant === "filled" && "bg-bg-band",
        className
      )}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-16">{children}</div>
    </section>
  );
}
