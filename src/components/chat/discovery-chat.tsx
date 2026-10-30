"use client";

import { useState } from "react";
import { sendMessageAction, reviewClaimAction } from "@/app/actions/discovery";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import type { DiscoveryMessage, Experience, ExperienceTask, SkillClaim } from "@/types/database";

type ChatItem = {
  role: "user" | "assistant";
  content: string;
  extracted?: {
    experience: Experience;
    tasks: ExperienceTask[];
    claims: SkillClaim[];
  };
};

export function DiscoveryChat({
  conversationId,
  initialMessages = [],
}: {
  conversationId: string;
  initialMessages?: DiscoveryMessage[];
}) {
  const [messages, setMessages] = useState<ChatItem[]>(
    initialMessages.length > 0
      ? initialMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))
      : [
          {
            role: "assistant",
            content:
              "Welcome to Discovery Intelligence. Describe something real you have organized, built, resolved, learned, or helped with. Tell me what happened, what role you personally played, and what obstacles arose.",
          },
        ],
  );

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickStarters = [
    "I organized a community educational workshop for 150 participants with local volunteer support.",
    "I built a custom web tool and automation scripts independently to solve an inventory backlog.",
    "I coordinated emergency supplier outreach and resolved space logistics during an unexpected outage.",
  ];

  async function handleSend(textToSend?: string) {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    setError(null);
    setInput("");
    setLoading(true);

    const userItem: ChatItem = { role: "user", content: text };
    setMessages((prev) => [...prev, userItem]);

    const result = await sendMessageAction(conversationId, text);

    if (result.ok && result.response) {
      const assistantItem: ChatItem = {
        role: "assistant",
        content: result.response.reply,
        extracted: result.response.extractedExperience,
      };
      setMessages((prev) => [...prev, assistantItem]);
    } else {
      setError(result.message || "Failed to process message.");
    }

    setLoading(false);
  }

  async function handleReviewClaim(
    claimId: string,
    decision: "accepted" | "rejected" | "corrected",
  ) {
    let correction: string | undefined;
    if (decision === "corrected") {
      const entered = window.prompt("Enter your corrected explanation for this capability:");
      if (!entered) return;
      correction = entered;
    }

    await reviewClaimAction({ claimId, decision, correction });
    alert(`Capability marked as ${decision}.`);
  }

  return (
    <div className="space-y-6">
      {/* Quick Prompts */}
      {messages.length <= 1 ? (
        <div className="rounded-sm border border-line bg-paper-raised p-4">
          <p className="text-xs uppercase tracking-wider text-ink-soft mb-2 font-medium">
            Try a real scenario starter
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {quickStarters.map((starter, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(starter)}
                className="text-left rounded border border-line bg-paper p-3 text-xs text-ink hover:border-ink transition-colors leading-relaxed"
              >
                “{starter}”
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Message History */}
      <div className="space-y-6">
        {messages.map((item, index) => (
          <div
            key={index}
            className={`rounded-sm border p-5 ${
              item.role === "user"
                ? "border-line bg-paper-raised ml-6"
                : "border-line bg-paper mr-6"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                {item.role === "user" ? "You" : "Discovery Assistant"}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-ink whitespace-pre-wrap">{item.content}</p>

            {/* Extracted Experience Card */}
            {item.extracted ? (
              <div className="mt-6 rounded-sm border border-line bg-paper-raised p-5 space-y-4">
                <div className="border-b border-line pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-ok font-semibold">
                      Extracted Experience
                    </span>
                    <span className="text-xs text-ink-soft">
                      Category: {item.extracted.experience.category}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl mt-1 text-ink">
                    {item.extracted.experience.title}
                  </h3>
                  {item.extracted.experience.role_or_contribution ? (
                    <p className="text-xs text-ink-soft mt-0.5">
                      Role: {item.extracted.experience.role_or_contribution}
                    </p>
                  ) : null}
                </div>

                {/* Decomposed Tasks */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-ink mb-2">
                    Decomposed Tasks ({item.extracted.tasks.length})
                  </h4>
                  <div className="space-y-2">
                    {item.extracted.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded border border-line bg-paper p-3 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-ink">{task.description}</p>
                          <span className="rounded bg-paper-raised px-1.5 py-0.5 text-[10px] text-ink-soft border border-line">
                            {task.contribution_type}
                          </span>
                        </div>
                        {task.actions.length > 0 ? (
                          <p className="text-ink-soft text-[11px]">
                            <strong className="text-ink">Actions:</strong> {task.actions.join(" · ")}
                          </p>
                        ) : null}
                        {task.tools.length > 0 ? (
                          <p className="text-ink-soft text-[11px]">
                            <strong className="text-ink">Tools:</strong> {task.tools.join(", ")}
                          </p>
                        ) : null}
                        {task.obstacles.length > 0 ? (
                          <p className="text-ink-soft text-[11px]">
                            <strong className="text-ink">Obstacles:</strong> {task.obstacles.join(" · ")}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inferred Skills */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
                    Inferred Capabilities ({item.extracted.claims.length})
                  </h4>
                  <div className="space-y-2">
                    {item.extracted.claims.map((claim) => (
                      <div
                        key={claim.id}
                        className="rounded border border-line bg-paper p-3 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-ink text-sm">
                            {claim.skill?.name || "Capability"}
                          </p>
                          <span className="rounded bg-accent-soft px-2 py-0.5 text-[10px] text-ink border border-line font-medium">
                            Confidence: {Math.round((claim.evidence_confidence || 0.8) * 100)}%
                          </span>
                        </div>
                        <p className="text-ink-soft text-xs leading-relaxed">
                          {claim.inference_explanation}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-line">
                          <span className="text-[10px] uppercase tracking-wider text-ink-soft">
                            Review inference:
                          </span>
                          <button
                            type="button"
                            onClick={() => handleReviewClaim(claim.id, "accepted")}
                            className="rounded bg-ok text-paper-raised px-2 py-1 text-[11px] font-medium hover:opacity-90"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReviewClaim(claim.id, "rejected")}
                            className="rounded border border-line bg-paper-raised text-ink px-2 py-1 text-[11px] font-medium hover:border-ink"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReviewClaim(claim.id, "corrected")}
                            className="rounded border border-line bg-paper-raised text-ink-soft px-2 py-1 text-[11px] font-medium hover:text-ink"
                          >
                            Correct
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ))}

        {loading ? (
          <div className="rounded-sm border border-line bg-paper p-5 mr-6 animate-pulse">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Discovery Assistant
            </span>
            <p className="mt-2 text-sm text-ink-soft">
              Analyzing narrative, checking contributions, and identifying tasks...
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-sm border border-line bg-accent-soft p-4 text-xs text-danger">
            {error}
          </div>
        ) : null}
      </div>

      {/* Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="rounded-sm border border-line bg-paper-raised p-4 space-y-3"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe what you built, organized, solved, learned, or helped with..."
          className="min-h-24 bg-paper"
          disabled={loading}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-ink-soft">
            Include what obstacles you faced and what happened as a result.
          </p>
          <Button type="submit" disabled={loading || !input.trim()}>
            {loading ? "Analyzing…" : "Send Experience"}
          </Button>
        </div>
      </form>
    </div>
  );
}
