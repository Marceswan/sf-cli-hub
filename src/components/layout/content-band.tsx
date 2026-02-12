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
      <div className="grid grid-cols-[1fr_minmax(0,1200px)_1fr]">
        <div className="max-sm:hidden grid-line-pattern" />
        <div className="col-start-2 px-6 py-16">{children}</div>
        <div className="max-sm:hidden grid-line-pattern" />
      </div>
    </section>
  );
}
