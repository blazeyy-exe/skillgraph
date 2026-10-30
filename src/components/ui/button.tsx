import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-paper-raised hover:bg-accent-hover disabled:opacity-50",
  secondary:
    "border border-line bg-paper-raised text-ink hover:border-ink disabled:opacity-50",
  ghost: "text-ink hover:bg-accent-soft/60 disabled:opacity-50",
  danger: "bg-danger text-paper-raised hover:opacity-90 disabled:opacity-50",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-sm font-medium tracking-wide transition-colors",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
