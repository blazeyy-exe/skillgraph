"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAppUrl, isSupabaseConfigured } from "@/lib/config";
import { log } from "@/lib/logging";
import { rateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  loginSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@/lib/validation/auth";

export type ActionState = {
  ok: boolean;
  message: string;
};

function unconfigured(): ActionState {
  return {
    ok: false,
    message:
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local. See SETUP.md.",
  };
}

async function clientOrNull() {
  if (!isSupabaseConfigured()) return null;
  return createSupabaseServerClient();
}

async function limit(action: string): Promise<ActionState | null> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const result = rateLimit(`auth:${action}:${ip}`, 8, 10 * 60 * 1000);
  if (!result.ok) {
    return {
      ok: false,
      message: `Too many attempts. Try again in ${result.retryAfterSeconds} seconds.`,
    };
  }
  return null;
}

export async function signUpAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const blocked = await limit("signup");
  if (blocked) return blocked;

  const parsed = signUpSchema.safeParse({
    preferredName: formData.get("preferredName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const supabase = await clientOrNull();
  if (!supabase) return unconfigured();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { preferred_name: parsed.data.preferredName },
      emailRedirectTo: `${getAppUrl()}/auth/callback?next=/app/onboarding`,
    },
  });

  if (error) {
    log.warn("signup_failed", { code: error.message });
    return { ok: false, message: error.message };
  }

  redirect("/verify-email");
}

export async function loginAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const blocked = await limit("login");
  if (blocked) return blocked;

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const supabase = await clientOrNull();
  if (!supabase) return unconfigured();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, message: "Email or password is incorrect." };
  }

  const next = String(formData.get("next") || "/app");
  const safeNext = next.startsWith("/app") ? next : "/app";
  redirect(safeNext);
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/");
}

export async function forgotPasswordAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const blocked = await limit("forgot");
  if (blocked) return blocked;

  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Enter a valid email." };
  }

  const supabase = await clientOrNull();
  if (!supabase) return unconfigured();

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getAppUrl()}/auth/callback?next=/update-password`,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return {
    ok: true,
    message: "If that account exists, a recovery email is on its way.",
  };
}

export async function updatePasswordAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const supabase = await clientOrNull();
  if (!supabase) return unconfigured();

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { ok: false, message: error.message };
  }

  redirect("/app");
}
