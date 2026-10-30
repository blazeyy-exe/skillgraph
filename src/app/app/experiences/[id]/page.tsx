import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkspace } from "@/lib/data/workspace";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/config";
import { ExperienceDetailView } from "@/components/experiences/experience-detail-view";
import type {
  Experience,
  ExperienceTask,
  SkillSuggestion,
  SkillClaim,
} from "@/types/database";

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workspace = await getWorkspace();
  const supabase = await createSupabaseServerClient();

  let experience: Experience | null = null;
  let tasks: ExperienceTask[] = [];
  let suggestions: SkillSuggestion[] = [];
  let claims: SkillClaim[] = [];

  if (supabase) {
    const { data: exp } = await supabase
      .from("experiences")
      .select("*")
      .eq("id", id)
      .eq("user_id", workspace.userId)
      .maybeSingle();

    if (exp) {
      experience = exp as Experience;

      const [{ data: tasksData }, { data: suggData }, { data: claimsData }] =
        await Promise.all([
          supabase
            .from("experience_tasks")
            .select("*")
            .eq("experience_id", id)
            .order("created_at", { ascending: true }),
          supabase
            .from("skill_suggestions")
            .select("*")
            .eq("experience_id", id)
            .order("created_at", { ascending: true }),
          supabase
            .from("skill_claims")
            .select("*, skill:skills(*)")
            .contains("source_experience_ids", [id])
            .eq("user_id", workspace.userId),
        ]);

      tasks = (tasksData as ExperienceTask[]) || [];
      suggestions = (suggData as SkillSuggestion[]) || [];
      claims = (claimsData as SkillClaim[]) || [];
    }
  } else if (isDemoMode()) {
    experience = {
      id,
      user_id: workspace.userId,
      conversation_id: null,
      title: "Community Educational Workshop Organization",
      description:
        "Organized weekend learning sessions for 150 participants. Secured venue sponsorships from local vendors, coordinated 8 youth volunteers, and resolved emergency space logistics.",
      experience_type: "Community work",
      organization_name: null,
      start_date: null,
      end_date: null,
      user_contribution: "Lead organizer and volunteer coordinator",
      challenges: ["Short-notice volunteer dropouts", "Facility constraints"],
      outcomes: ["Maintained 100% attendee support ratios"],
      tools_used: ["Spreadsheets", "Messaging apps"],
      status: "extracted",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    tasks = [
      {
        id: "task-1",
        experience_id: id,
        user_id: workspace.userId,
        description: "Recruited, scheduled, and supervised 8 volunteers across multiple sessions",
        action_type: "coordination",
        tools_used: ["Spreadsheets", "Messaging apps"],
        complexity: "medium",
        responsibility_level: "lead",
        supporting_context: "Ensured reliable staffing ratios and replaced short-notice cancellations.",
        extraction_source: "conversation",
        user_review_status: "accepted",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "task-2",
        experience_id: id,
        user_id: workspace.userId,
        description: "Negotiated sponsor agreements with 3 community merchants",
        action_type: "communication",
        tools_used: ["Outreach templates"],
        complexity: "medium",
        responsibility_level: "owner",
        supporting_context: "Secured supplies at zero cost through community outreach.",
        extraction_source: "conversation",
        user_review_status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    suggestions = [
      {
        id: "sugg-1",
        user_id: workspace.userId,
        experience_id: id,
        task_id: "task-1",
        suggested_skill_name: "Volunteer Coordination & Management",
        skill_description:
          "Recruit, schedule, direct, and motivate volunteers in community initiatives.",
        inference_explanation:
          "The user directly scheduled volunteer shifts, delivered briefings, and resolved coverage gaps.",
        supporting_evidence:
          "Scheduled and supervised 8 volunteers across weekend workshop sessions.",
        confidence_level: 0.88,
        review_status: "accepted",
        taxonomy_reference: "esco:volunteer-management",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  if (!experience) {
    notFound();
  }

  return (
    <ExperienceDetailView
      initialExperience={experience}
      initialTasks={tasks}
      initialSuggestions={suggestions}
      initialClaims={claims}
    />
  );
}
