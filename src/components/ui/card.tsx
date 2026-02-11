import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ className, hover = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-bg-card border border-border rounded-card p-6 relative overflow-hidden flex flex-col justify-between",
        hover &&
          "transition-all duration-200 hover:border-accent hover:-translate-y-0.5 hover:shadow-glow",
        className
      )}
      {...props}
    />
  );
}

export function CardIcon({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "w-12 h-12 bg-bg-surface border border-border rounded-[10px] flex items-center justify-center mb-4 text-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardMeta({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex justify-between items-center text-sm text-text-muted font-mono border-t border-border pt-4",
        className
      )}
      {...props}
    />
  );
}
