"use client";

import Link from "next/link";
import { reviewClaimAction } from "@/app/actions/discovery";
import type { Experience, ExperienceTask, SkillClaim } from "@/types/database";

export function ExperienceList({
  experiences,
  tasksByExperience,
  claimsByExperience,
}: {
  experiences: Experience[];
  tasksByExperience: Record<string, ExperienceTask[]>;
  claimsByExperience: Record<string, SkillClaim[]>;
}) {
  async function handleReview(
    claimId: string,
    decision: "accepted" | "rejected" | "corrected",
  ) {
    let correction: string | undefined;
    if (decision === "corrected") {
      const entered = window.prompt("Enter your corrected explanation:");
      if (!entered) return;
      correction = entered;
    }

    await reviewClaimAction({ claimId, decision, correction });
    window.location.reload();
  }

  if (experiences.length === 0) {
    return (
      <div className="rounded-sm border border-line bg-paper-raised p-8 text-center">
        <h2 className="font-serif text-2xl text-ink">No experiences recorded yet</h2>
        <p className="mt-2 text-sm text-ink-soft max-w-md mx-auto leading-relaxed">
          Start by telling Discovery Intelligence about a project, community initiative, informal role, or independent learning effort.
        </p>
        <Link
          href="/app/discover"
          className="mt-6 inline-block rounded-sm bg-accent px-4 py-2 text-sm font-medium text-paper-raised hover:bg-accent-hover"
        >
          Discover your first experience
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {experiences.map((exp) => {
        const tasks = tasksByExperience[exp.id] || [];
        const claims = claimsByExperience[exp.id] || [];

        return (
          <div key={exp.id} className="rounded-sm border border-line bg-paper-raised p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-line pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                    {exp.category || "General Experience"}
                  </span>
                  <span className="text-[10px] rounded bg-paper px-2 py-0.5 text-ink-soft border border-line uppercase">
                    {exp.status}
                  </span>
                </div>
                <h2 className="font-serif text-2xl text-ink mt-1">
                  <Link href={`/app/experiences/${exp.id}`} className="hover:underline">
                    {exp.title}
                  </Link>
                </h2>
                {exp.role_or_contribution ? (
                  <p className="text-xs text-ink-soft mt-0.5">Role: {exp.role_or_contribution}</p>
                ) : null}
              </div>
              <Link
                href={`/app/experiences/${exp.id}`}
                className="text-xs font-medium text-accent hover:underline self-start sm:self-auto"
              >
                View full breakdown →
              </Link>
            </div>

            <p className="text-sm text-ink-soft italic leading-relaxed">
              “{exp.narrative}”
            </p>

            {/* Tasks Summary */}
            {tasks.length > 0 ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink mb-2">
                  Extracted Tasks ({tasks.length})
                </p>
                <ul className="space-y-1.5 text-xs text-ink-soft">
                  {tasks.map((task) => (
                    <li key={task.id} className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>
                        <strong className="text-ink">{task.description}</strong>{" "}
                        <span className="text-[10px] text-ink-soft">({task.contribution_type})</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Inferred Capabilities */}
            {claims.length > 0 ? (
              <div className="border-t border-line pt-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
                  Inferred Capabilities ({claims.length})
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {claims.map((claim) => (
                    <div
                      key={claim.id}
                      className="rounded border border-line bg-paper p-3 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-ink">{claim.skill?.name || "Capability"}</p>
                        <span className="rounded bg-paper-raised px-1.5 py-0.5 text-[10px] text-ink font-medium border border-line">
                          {claim.evidence_state}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-soft leading-relaxed line-clamp-2">
                        {claim.inference_explanation}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[10px]">
                        <span className="text-ink-soft">
                          Status: <strong className="text-ink">{claim.user_review}</strong>
                        </span>
                        {claim.user_review === "pending" ? (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleReview(claim.id, "accepted")}
                              className="text-ok font-medium hover:underline"
                            >
                              Accept
                            </button>
                            <span>·</span>
                            <button
                              type="button"
                              onClick={() => handleReview(claim.id, "rejected")}
                              className="text-danger font-medium hover:underline"
                            >
                              Reject
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
