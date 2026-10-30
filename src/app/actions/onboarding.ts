"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { onboardingSchema, profileSettingsSchema } from "@/lib/validation/onboarding";
import { log } from "@/lib/logging";

export type SaveState = {
  ok: boolean;
  message: string;
};

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { supabase: null, user: null as null };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function saveOnboardingAction(
  _prev: SaveState | null,
  formData: FormData,
): Promise<SaveState> {
  const { supabase, user } = await requireUser();
  if (!supabase || !user) {
    return { ok: false, message: "You need to be signed in." };
  }

  const interests = formData.getAll("interests").map(String);
  const experienceCategories = formData.getAll("experienceCategories").map(String);
  const complete = formData.get("complete") === "true";

  const parsed = onboardingSchema.safeParse({
    preferredName: formData.get("preferredName"),
    location: formData.get("location") || "",
    educationalBackground: formData.get("educationalBackground") || "",
    currentSituation: formData.get("currentSituation") || "",
    preferredLanguage: formData.get("preferredLanguage") || "en",
    interests,
    experienceCategories,
    goalTitle: formData.get("goalTitle") || "",
    goalDescription: formData.get("goalDescription") || "",
    complete,
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const data = parsed.data;
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      preferred_name: data.preferredName,
      location: data.location || null,
      educational_background: data.educationalBackground || null,
      current_situation: data.currentSituation || null,
      preferred_language: data.preferredLanguage,
      onboarding_step: complete ? 4 : 3,
      onboarding_completed_at: complete ? new Date().toISOString() : null,
    })
    .eq("id", user.id);

  if (profileError) {
    log.error("onboarding_profile_update_failed", { message: profileError.message });
    return { ok: false, message: profileError.message };
  }

  const { error: prefError } = await supabase
    .from("user_preferences")
    .update({
      interests: data.interests,
      experience_categories: data.experienceCategories,
    })
    .eq("user_id", user.id);

  if (prefError) {
    return { ok: false, message: prefError.message };
  }

  if (data.goalTitle) {
    const { data: existing } = await supabase
      .from("user_goals")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      await supabase
        .from("user_goals")
        .update({
          title: data.goalTitle,
          description: data.goalDescription || null,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("user_goals").insert({
        user_id: user.id,
        title: data.goalTitle,
        description: data.goalDescription || null,
        status: "active",
      });
    }
  }

  if (complete) {
    redirect("/app");
  }

  return { ok: true, message: "Progress saved. You can finish this later." };
}

export async function skipOnboardingAction(): Promise<void> {
  const { supabase, user } = await requireUser();
  if (!supabase || !user) {
    redirect("/login");
  }

  await supabase
    .from("profiles")
    .update({
      onboarding_completed_at: new Date().toISOString(),
      onboarding_step: 4,
    })
    .eq("id", user.id);

  redirect("/app");
}

export async function updateProfileAction(
  _prev: SaveState | null,
  formData: FormData,
): Promise<SaveState> {
  const { supabase, user } = await requireUser();
  if (!supabase || !user) {
    return { ok: false, message: "You need to be signed in." };
  }

  const parsed = profileSettingsSchema.safeParse({
    preferredName: formData.get("preferredName"),
    location: formData.get("location") || "",
    educationalBackground: formData.get("educationalBackground") || "",
    currentSituation: formData.get("currentSituation") || "",
    preferredLanguage: formData.get("preferredLanguage") || "en",
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      preferred_name: parsed.data.preferredName,
      location: parsed.data.location || null,
      educational_background: parsed.data.educationalBackground || null,
      current_situation: parsed.data.currentSituation || null,
      preferred_language: parsed.data.preferredLanguage,
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Profile updated." };
}
