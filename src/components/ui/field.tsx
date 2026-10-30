import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Label({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="text-sm font-medium text-ink">{children}</span>
      {hint ? <span className="mt-0.5 block text-sm text-ink-soft">{hint}</span> : null}
    </label>
  );
}

const controlClass =
  "mt-1.5 w-full rounded-sm border border-line bg-paper-raised px-3 py-2.5 text-ink placeholder:text-ink-soft/70";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, props.className)} {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClass, "min-h-28", props.className)} {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(controlClass, props.className)} {...props} />;
}

export function FormMessage({
  tone = "danger",
  children,
}: {
  tone?: "danger" | "ok";
  children: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <p
      role={tone === "danger" ? "alert" : "status"}
      className={cn("text-sm", tone === "danger" ? "text-danger" : "text-ok")}
    >
      {children}
    </p>
  );
}
