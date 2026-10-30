import Link from "next/link";
import { getWorkspace } from "@/lib/data/workspace";
import { CURRENT_SITUATIONS } from "@/lib/constants";

export default async function AppOverviewPage() {
  const workspace = await getWorkspace();
  const profile = workspace.profile;
  const goals = workspace.goals;

  const situationLabel =
    CURRENT_SITUATIONS.find((s) => s.value === profile?.current_situation)?.label ??
    profile?.current_situation ??
    "Not specified";

  const isOnboardingComplete = Boolean(profile?.onboarding_completed_at);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-line pb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Workspace Overview</p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl">
          Welcome, {profile?.preferred_name || "there"}
        </h1>
        <p className="mt-1 text-ink-soft text-sm">
          Current situation: <span className="font-medium text-ink">{situationLabel}</span>
          {profile?.location ? ` · ${profile.location}` : ""}
        </p>

        {!isOnboardingComplete ? (
          <div className="mt-4 rounded-sm border border-line bg-accent-soft p-4 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-semibold text-ink">Onboarding in progress</p>
              <p className="text-ink-soft text-xs mt-0.5">
                Complete your profile and goals to get calibrated recommendations.
              </p>
            </div>
            <Link
              href="/app/onboarding"
              className="inline-block rounded-sm bg-accent px-3 py-1.5 text-xs font-medium text-paper-raised hover:bg-accent-hover self-start sm:self-auto"
            >
              Continue onboarding
            </Link>
          </div>
        ) : null}
      </div>

      {/* Capability Lifecycle Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-sm border border-line bg-paper-raised p-4">
          <p className="text-xs uppercase tracking-wider text-ink-soft">Inferred Skills</p>
          <p className="mt-2 font-serif text-3xl text-ink">0</p>
          <p className="mt-1 text-[11px] text-ink-soft">From real experiences</p>
        </div>
        <div className="rounded-sm border border-line bg-paper-raised p-4">
          <p className="text-xs uppercase tracking-wider text-ink-soft">Developing</p>
          <p className="mt-2 font-serif text-3xl text-ink">0</p>
          <p className="mt-1 text-[11px] text-ink-soft">Active practice / tasks</p>
        </div>
        <div className="rounded-sm border border-line bg-paper-raised p-4">
          <p className="text-xs uppercase tracking-wider text-ok">Demonstrated</p>
          <p className="mt-2 font-serif text-3xl text-ok">0</p>
          <p className="mt-1 text-[11px] text-ink-soft">Verified by challenge</p>
        </div>
        <div className="rounded-sm border border-line bg-paper-raised p-4">
          <p className="text-xs uppercase tracking-wider text-accent">Evidence Items</p>
          <p className="mt-2 font-serif text-3xl text-accent">0</p>
          <p className="mt-1 text-[11px] text-ink-soft">Vault documents &amp; links</p>
        </div>
      </div>

      {/* Active Goals */}
      <div className="rounded-sm border border-line bg-paper-raised p-6">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h2 className="font-serif text-2xl">Active Goals</h2>
            <p className="text-xs text-ink-soft">The directions you are developing toward</p>
          </div>
          <Link
            href="/app/profile"
            className="text-xs font-medium text-accent underline hover:text-accent-hover"
          >
            Manage goals
          </Link>
        </div>

        <div className="mt-4">
          {goals && goals.length > 0 ? (
            <div className="space-y-3">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-sm border border-line bg-paper p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div>
                    <p className="font-medium text-sm text-ink">{goal.title}</p>
                    {goal.description ? (
                      <p className="text-xs text-ink-soft mt-0.5">{goal.description}</p>
                    ) : null}
                  </div>
                  <span className="inline-block rounded bg-paper-raised px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink border border-line self-start sm:self-auto">
                    {goal.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-ink-soft">
              <p>No active goals recorded yet.</p>
              <Link
                href="/app/onboarding"
                className="mt-2 inline-block text-xs font-medium text-accent underline"
              >
                Set your primary goal
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions / Core Workspaces */}
      <div>
        <h2 className="font-serif text-2xl mb-4">Capability Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/app/discover"
            className="group rounded-sm border border-line bg-paper-raised p-5 transition-colors hover:border-ink"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">Phase 2</span>
              <span className="text-xs text-ink-soft group-hover:text-ink">Open →</span>
            </div>
            <h3 className="mt-2 font-serif text-xl group-hover:text-accent">Experience Intelligence</h3>
            <p className="mt-1 text-xs text-ink-soft leading-relaxed">
              Have an investigative AI conversation to unpack your everyday experiences into concrete tasks and inferred capabilities.
            </p>
          </Link>

          <Link
            href="/app/graph"
            className="group rounded-sm border border-line bg-paper-raised p-5 transition-colors hover:border-ink"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">Phase 3</span>
              <span className="text-xs text-ink-soft group-hover:text-ink">Open →</span>
            </div>
            <h3 className="mt-2 font-serif text-xl group-hover:text-accent">Living SkillGraph</h3>
            <p className="mt-1 text-xs text-ink-soft leading-relaxed">
              Explore the interactive map of your capabilities, relationships, and cross-experience patterns.
            </p>
          </Link>

          <Link
            href="/app/challenges"
            className="group rounded-sm border border-line bg-paper-raised p-5 transition-colors hover:border-ink"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">Phase 5</span>
              <span className="text-xs text-ink-soft group-hover:text-ink">Open →</span>
            </div>
            <h3 className="mt-2 font-serif text-xl group-hover:text-accent">Challenge Lab</h3>
            <p className="mt-1 text-xs text-ink-soft leading-relaxed">
              Verify your inferred skills through scenario-based assessments evaluated against transparent rubrics.
            </p>
          </Link>

          <Link
            href="/app/opportunities"
            className="group rounded-sm border border-line bg-paper-raised p-5 transition-colors hover:border-ink"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">Phase 7</span>
              <span className="text-xs text-ink-soft group-hover:text-ink">Open →</span>
            </div>
            <h3 className="mt-2 font-serif text-xl group-hover:text-accent">Opportunity Engine</h3>
            <p className="mt-1 text-xs text-ink-soft leading-relaxed">
              Discover real jobs, projects, and programs matched to your demonstrated and transferable capabilities.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
