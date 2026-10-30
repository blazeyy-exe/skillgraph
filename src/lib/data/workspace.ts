import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/config";
import type { Profile, UserGoal, UserPreferences, WorkspaceSnapshot } from "@/types/database";

export async function getWorkspace(): Promise<WorkspaceSnapshot & { userId: string }> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    if (isDemoMode()) {
      return {
        userId: "demo-user-id",
        email: "demo@skillgraph.internal",
        profile: {
          id: "demo-user-id",
          preferred_name: "Alex (Demo)",
          location: "Kathmandu, Nepal",
          educational_background: null,
          current_situation: "self_taught",
          preferred_language: "en",
          onboarding_completed_at: new Date().toISOString(),
          onboarding_step: 4,
          is_admin: false,
          deleted_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        preferences: {
          user_id: "demo-user-id",
          interests: ["technology", "community", "systems"],
          experience_categories: ["building", "organising", "technical"],
          marketing_email_opt_in: false,
          ai_processing_opt_in: true,
          model_training_consent: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        goals: [
          {
            id: "goal-demo-1",
            user_id: "demo-user-id",
            title: "Transition to Systems Engineering",
            description: "Translate informal technical projects and community organizing into verified capabilities.",
            status: "active",
            target_occupation_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      };
    }
    redirect("/login?reason=unconfigured");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: preferences }, { data: goals }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  return {
    userId: user.id,
    email: user.email ?? null,
    profile: (profile as Profile | null) ?? null,
    preferences: (preferences as UserPreferences | null) ?? null,
    goals: (goals as UserGoal[] | null) ?? [],
  };
}

export async function requireOnboardingComplete() {
  const workspace = await getWorkspace();
  if (!workspace.profile?.onboarding_completed_at) {
    redirect("/app/onboarding");
  }
  return workspace;
}
