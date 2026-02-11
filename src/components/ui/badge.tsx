import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-bg-surface border border-border text-primary font-mono",
  primary:
    "bg-primary/10 border border-primary/20 text-primary",
  success:
    "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500",
  warning:
    "bg-amber-500/10 border border-amber-500/20 text-amber-500",
  danger:
    "bg-red-500/10 border border-red-500/20 text-red-500",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-0.5 rounded-full text-xs",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
