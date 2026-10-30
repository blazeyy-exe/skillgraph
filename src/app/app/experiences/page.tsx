import Link from "next/link";
import { getWorkspace } from "@/lib/data/workspace";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/config";
import { ExperienceList } from "@/components/experiences/experience-list";
import type { Experience, ExperienceTask, SkillClaim } from "@/types/database";

export default async function ExperiencesPage() {
  const workspace = await getWorkspace();
  const supabase = await createSupabaseServerClient();

  let experiences: Experience[] = [];
  const tasksByExperience: Record<string, ExperienceTask[]> = {};
  const claimsByExperience: Record<string, SkillClaim[]> = {};

  if (supabase) {
    const { data: expData } = await supabase
      .from("experiences")
      .select("*")
      .eq("user_id", workspace.userId)
      .order("created_at", { ascending: false });

    experiences = (expData as Experience[]) || [];

    if (experiences.length > 0) {
      const expIds = experiences.map((e) => e.id);

      const [{ data: tasksData }, { data: claimsData }] = await Promise.all([
        supabase
          .from("experience_tasks")
          .select("*")
          .in("experience_id", expIds)
          .order("order_index", { ascending: true }),
        supabase
          .from("skill_claims")
          .select("*, skill:skills(*)")
          .eq("user_id", workspace.userId),
      ]);

      const tasks = (tasksData as ExperienceTask[]) || [];
      const claims = (claimsData as SkillClaim[]) || [];

      for (const t of tasks) {
        if (!tasksByExperience[t.experience_id]) {
          tasksByExperience[t.experience_id] = [];
        }
        tasksByExperience[t.experience_id].push(t);
      }

      for (const c of claims) {
        for (const expId of c.source_experience_ids) {
          if (!claimsByExperience[expId]) {
            claimsByExperience[expId] = [];
          }
          claimsByExperience[expId].push(c);
        }
      }
    }
  } else if (isDemoMode()) {
    // Provide illustrative demo experience in demo mode
    const demoId = "demo-exp-1";
    experiences = [
      {
        id: demoId,
        user_id: workspace.userId,
        title: "Community Educational Workshop Organization",
        narrative:
          "Organized weekend learning sessions for 150 participants. Secured venue sponsorships from local vendors, coordinated 8 youth volunteers, and resolved emergency space logistics.",
        source: "conversation",
        status: "extracted",
        category: "Community Organizing",
        role_or_contribution: "Lead organizer and volunteer coordinator",
        occurred_at: "Summer 2026",
        location: "Kathmandu",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    tasksByExperience[demoId] = [
      {
        id: "task-demo-1",
        experience_id: demoId,
        user_id: workspace.userId,
        description: "Recruited, scheduled, and supervised 8 volunteers across multiple sessions",
        contribution_type: "individual",
        actions: ["Created volunteer rota", "Delivered pre-event briefings"],
        tools: ["Spreadsheets", "Messaging apps"],
        obstacles: ["Short-notice volunteer dropouts"],
        outcomes: ["Maintained 100% attendee support ratios"],
        order_index: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "task-demo-2",
        experience_id: demoId,
        user_id: workspace.userId,
        description: "Negotiated sponsor agreements with 3 community merchants",
        contribution_type: "individual",
        actions: ["Drafted partnership terms", "Conducted in-person meetings"],
        tools: ["Outreach templates"],
        obstacles: ["Initial skepticism"],
        outcomes: ["Secured all supplies at zero operational cost"],
        order_index: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    claimsByExperience[demoId] = [
      {
        id: "claim-demo-1",
        user_id: workspace.userId,
        skill_id: "skill-demo-1",
        evidence_state: "inferred",
        user_review: "pending",
        evidence_confidence: 0.88,
        proficiency_level: "intermediate",
        evidence_coverage: 0.6,
        inference_explanation:
          "Demonstrated direct capability in volunteer recruitment, briefing, and scheduling under real-world operational constraints.",
        source_experience_ids: [demoId],
        source_task_ids: ["task-demo-1"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        skill: {
          id: "skill-demo-1",
          canonical_id: "esco:volunteer-management",
          name: "Volunteer Coordination & Management",
          description: "Recruit, schedule, direct, and motivate volunteers in community or non-profit initiatives.",
          category: "Leadership & Organizing",
          observable_behaviours: [],
          source: "esco",
          source_ref: null,
          created_at: new Date().toISOString(),
        },
      },
      {
        id: "claim-demo-2",
        user_id: workspace.userId,
        skill_id: "skill-demo-2",
        evidence_state: "inferred",
        user_review: "pending",
        evidence_confidence: 0.84,
        proficiency_level: "intermediate",
        evidence_coverage: 0.5,
        inference_explanation:
          "Successfully framed mutual community value and negotiated sponsorship terms with merchants.",
        source_experience_ids: [demoId],
        source_task_ids: ["task-demo-2"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        skill: {
          id: "skill-demo-2",
          canonical_id: "esco:stakeholder-negotiation",
          name: "Community Stakeholder Outreach & Negotiation",
          description: "Engage community partners, business owners, and sponsors to secure resources.",
          category: "Communication",
          observable_behaviours: [],
          source: "esco",
          source_ref: null,
          created_at: new Date().toISOString(),
        },
      },
    ];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Phase 2 — Active</p>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl">Experience Library</h1>
          <p className="mt-1 text-ink-soft text-sm">
            Review your submitted experiences, decomposed tasks, and inferred skill claims.
          </p>
        </div>
        <Link
          href="/app/discover"
          className="rounded-sm bg-accent px-4 py-2 text-sm font-medium text-paper-raised hover:bg-accent-hover self-start sm:self-auto"
        >
          + Add Experience
        </Link>
      </div>

      <ExperienceList
        experiences={experiences}
        tasksByExperience={tasksByExperience}
        claimsByExperience={claimsByExperience}
      />
    </div>
  );
}
