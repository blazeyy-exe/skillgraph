"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/config";
import { log } from "@/lib/logging";

export type PreferenceState = {
  ok: boolean;
  message: string;
};

export async function updatePreferencesAction(
  _prev: PreferenceState | null,
  formData: FormData,
): Promise<PreferenceState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Supabase is not configured." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "You need to be signed in." };
  }

  const aiProcessing = formData.get("aiProcessing") === "on";
  const modelTraining = formData.get("modelTraining") === "on";
  const marketingEmail = formData.get("marketingEmail") === "on";

  const { error } = await supabase
    .from("user_preferences")
    .update({
      ai_processing_opt_in: aiProcessing,
      model_training_consent: modelTraining,
      marketing_email_opt_in: marketingEmail,
    })
    .eq("user_id", user.id);

  if (error) {
    log.error("update_preferences_failed", { message: error.message });
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Preferences updated successfully." };
}

export async function requestPasswordResetAction(
  prevState?: PreferenceState | null,
): Promise<PreferenceState> {
  void prevState;
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Supabase is not configured." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { ok: false, message: "No active user email found." };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${getAppUrl()}/auth/callback?next=/update-password`,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: `Password reset email sent to ${user.email}.` };
}
