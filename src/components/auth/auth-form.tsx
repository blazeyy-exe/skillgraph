"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage, Input, Label } from "@/components/ui/field";
import type { ActionState } from "@/app/actions/auth";

export function AuthForm({
  title,
  subtitle,
  action,
  submitLabel,
  fields,
  footer,
  hiddenFields,
}: {
  title: string;
  subtitle?: string;
  action: (state: ActionState | null, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  fields: Array<{
    name: string;
    label: string;
    type?: string;
    autoComplete?: string;
    required?: boolean;
    hint?: string;
  }>;
  footer?: React.ReactNode;
  hiddenFields?: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="font-serif text-4xl">{title}</h1>
      {subtitle ? <p className="mt-2 text-ink-soft">{subtitle}</p> : null}
      <form action={formAction} className="mt-8 space-y-4">
        {hiddenFields
          ? Object.entries(hiddenFields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))
          : null}
        {fields.map((field) => (
          <div key={field.name}>
            <Label htmlFor={field.name} hint={field.hint}>
              {field.label}
            </Label>
            <Input
              id={field.name}
              name={field.name}
              type={field.type ?? "text"}
              autoComplete={field.autoComplete}
              required={field.required}
            />
          </div>
        ))}
        {state ? <FormMessage tone={state.ok ? "ok" : "danger"}>{state.message}</FormMessage> : null}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Working…" : submitLabel}
        </Button>
      </form>
      {footer ? <div className="mt-6 text-sm text-ink-soft">{footer}</div> : null}
    </div>
  );
}

export function AuthLinks() {
  return (
    <p>
      Already have an account?{" "}
      <Link href="/login" className="text-ink underline">
        Log in
      </Link>
    </p>
  );
}
