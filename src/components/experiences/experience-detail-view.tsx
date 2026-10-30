"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  reviewTaskAction,
  addTaskAction,
  deleteTaskAction,
  reviewSkillSuggestionAction,
  updateExperienceAction,
} from "@/app/actions/discovery";
import { Button } from "@/components/ui/button";
import type {
  Experience,
  ExperienceTask,
  SkillSuggestion,
  SkillClaim,
} from "@/types/database";

export function ExperienceDetailView({
  initialExperience,
  initialTasks = [],
  initialSuggestions = [],
  initialClaims = [],
}: {
  initialExperience: Experience;
  initialTasks: ExperienceTask[];
  initialSuggestions: SkillSuggestion[];
  initialClaims: SkillClaim[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [experience, setExperience] = useState<Experience>(initialExperience);
  const [tasks, setTasks] = useState<ExperienceTask[]>(initialTasks);
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>(initialSuggestions);

  // Edit Experience State
  const [isEditingExp, setIsEditingExp] = useState(false);
  const [editTitle, setEditTitle] = useState(experience.title);
  const [editContribution, setEditContribution] = useState(
    experience.user_contribution || experience.role_or_contribution || "",
  );
  const [editTools, setEditTools] = useState(experience.tools_used.join(", "));

  // Add Task Modal State
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskActionType, setNewTaskActionType] = useState("operations");
  const [newTaskComplexity, setNewTaskComplexity] = useState<"low" | "medium" | "high">("medium");

  // Save Experience Edits
  function handleSaveExperience() {
    startTransition(async () => {
      const tools = editTools.split(",").map((s) => s.trim()).filter(Boolean);
      await updateExperienceAction({
        experienceId: experience.id,
        title: editTitle,
        userContribution: editContribution,
        toolsUsed: tools,
      });

      setExperience((prev) => ({
        ...prev,
        title: editTitle,
        user_contribution: editContribution,
        tools_used: tools,
      }));
      setIsEditingExp(false);
      router.refresh();
    });
  }

  // Review Task
  function handleReviewTask(
    taskId: string,
    status: "accepted" | "rejected" | "modified",
  ) {
    let description: string | undefined;
    if (status === "modified") {
      const current = tasks.find((t) => t.id === taskId)?.description || "";
      const entered = window.prompt("Edit task description:", current);
      if (!entered || !entered.trim()) return;
      description = entered.trim();
    }

    startTransition(async () => {
      await reviewTaskAction({ taskId, userReviewStatus: status, description });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                user_review_status: status,
                ...(description ? { description } : {}),
              }
            : t,
        ),
      );
    });
  }

  // Add Task
  function handleAddTask() {
    if (!newTaskDesc.trim()) return;
    startTransition(async () => {
      const res = await addTaskAction({
        experienceId: experience.id,
        description: newTaskDesc.trim(),
        actionType: newTaskActionType,
        complexity: newTaskComplexity,
      });

      if (res.ok && res.task) {
        setTasks((prev) => [...prev, res.task!]);
        setNewTaskDesc("");
        setShowAddTask(false);
      }
    });
  }

  // Delete Task
  function handleDeleteTask(taskId: string) {
    if (!confirm("Are you sure you want to remove this task?")) return;
    startTransition(async () => {
      await deleteTaskAction(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    });
  }

  // Review Skill Suggestion
  function handleReviewSuggestion(
    suggestionId: string,
    status: "accepted" | "rejected" | "modified",
  ) {
    let correctedExplanation: string | undefined;
    if (status === "modified") {
      const current = suggestions.find((s) => s.id === suggestionId)?.inference_explanation || "";
      const entered = window.prompt("Enter your corrected explanation for this skill:", current);
      if (!entered || !entered.trim()) return;
      correctedExplanation = entered.trim();
    }

    startTransition(async () => {
      await reviewSkillSuggestionAction({
        suggestionId,
        reviewStatus: status,
        correctedExplanation,
      });

      setSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestionId
            ? {
                ...s,
                review_status: status,
                ...(correctedExplanation
                  ? { inference_explanation: correctedExplanation }
                  : {}),
              }
            : s,
        ),
      );
    });
  }

  return (
    <div className="space-y-8">
      {/* Header & Back link */}
      <div>
        <Link
          href="/app/experiences"
          className="text-xs text-ink-soft hover:text-ink underline inline-block mb-3"
        >
          ← Back to Experience Library
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-accent font-semibold">
                {experience.experience_type || experience.category || "Experience"}
              </span>
              <span className="text-[10px] rounded bg-paper px-2 py-0.5 text-ink-soft border border-line uppercase">
                {experience.status}
              </span>
            </div>
            <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-ink">{experience.title}</h1>
            {experience.user_contribution || experience.role_or_contribution ? (
              <p className="text-xs text-ink-soft mt-1">
                Personal Role:{" "}
                <strong className="text-ink">
                  {experience.user_contribution || experience.role_or_contribution}
                </strong>
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="secondary"
              onClick={() => setIsEditingExp(!isEditingExp)}
              className="text-xs"
            >
              {isEditingExp ? "Cancel Editing" : "Edit Experience"}
            </Button>
          </div>
        </div>
      </div>

      {/* Editing Form */}
      {isEditingExp && (
        <div className="rounded-sm border border-accent bg-paper-raised p-6 space-y-4">
          <h2 className="font-serif text-xl text-ink">Edit Experience Details</h2>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-ink mb-1">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded border border-line bg-paper p-2 text-ink text-sm"
              />
            </div>
            <div>
              <label className="block font-medium text-ink mb-1">Personal Contribution &amp; Responsibilities</label>
              <textarea
                value={editContribution}
                onChange={(e) => setEditContribution(e.target.value)}
                className="w-full rounded border border-line bg-paper p-2 text-ink text-sm min-h-20"
              />
            </div>
            <div>
              <label className="block font-medium text-ink mb-1">Tools &amp; Methods Used (comma-separated)</label>
              <input
                type="text"
                value={editTools}
                onChange={(e) => setEditTools(e.target.value)}
                className="w-full rounded border border-line bg-paper p-2 text-ink"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-line">
            <Button variant="secondary" onClick={() => setIsEditingExp(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveExperience} disabled={isPending}>
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Original Narrative */}
      <div className="rounded-sm border border-line bg-paper-raised p-6">
        <h2 className="text-xs uppercase tracking-wider text-ink-soft font-semibold mb-2">
          Experience Narrative
        </h2>
        <p className="text-sm text-ink leading-relaxed italic">
          “{experience.description || experience.narrative}”
        </p>

        {experience.tools_used && experience.tools_used.length > 0 ? (
          <div className="mt-3 pt-3 border-t border-line text-xs">
            <span className="text-ink-soft font-medium">Tools &amp; Techniques: </span>
            <span className="text-ink">{experience.tools_used.join(", ")}</span>
          </div>
        ) : null}
      </div>

      {/* Decomposed Tasks with Full User Review */}
      <div className="rounded-sm border border-line bg-paper-raised p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <h2 className="font-serif text-2xl text-ink">Observable Tasks ({tasks.length})</h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Specific actions, tools, and outcomes extracted and reviewable by you.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddTask(true)}
            className="rounded bg-accent text-paper-raised px-3 py-1.5 text-xs font-medium hover:bg-accent-hover"
          >
            + Add Missing Task
          </button>
        </div>

        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div key={task.id} className="rounded border border-line bg-paper p-4 text-xs space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm text-ink">
                    {index + 1}. {task.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="rounded bg-paper-raised px-1.5 py-0.5 text-[10px] text-ink-soft border border-line uppercase">
                      Action: {task.action_type || task.contribution_type}
                    </span>
                    <span className="rounded bg-paper-raised px-1.5 py-0.5 text-[10px] text-ink-soft border border-line uppercase">
                      Level: {task.responsibility_level || "contributor"}
                    </span>
                    <span className="rounded bg-paper-raised px-1.5 py-0.5 text-[10px] text-ink-soft border border-line uppercase">
                      Status: <strong className="text-ink">{task.user_review_status || "pending"}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleReviewTask(task.id, "accepted")}
                    className={`rounded px-2.5 py-1 font-medium text-[11px] ${
                      task.user_review_status === "accepted"
                        ? "bg-ok text-paper-raised"
                        : "border border-line bg-paper-raised text-ink hover:border-ink"
                    }`}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewTask(task.id, "modified")}
                    className="rounded border border-line bg-paper-raised text-ink px-2.5 py-1 font-medium text-[11px] hover:border-ink"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className="rounded border border-line bg-paper-raised text-danger px-2.5 py-1 font-medium text-[11px] hover:border-danger"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {task.supporting_context ? (
                <p className="text-ink-soft text-[11px]">
                  <strong className="text-ink">Context:</strong> {task.supporting_context}
                </p>
              ) : null}

              {task.tools_used && task.tools_used.length > 0 ? (
                <p className="text-ink-soft text-[11px]">
                  <strong className="text-ink">Tools used:</strong> {task.tools_used.join(", ")}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Preliminary Skill Suggestions Section */}
      <div className="rounded-sm border border-line bg-paper-raised p-6 space-y-4">
        <div className="border-b border-line pb-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-ink">Preliminary Skill Suggestions</h2>
            <span className="text-[11px] text-ink-soft italic">
              ESCO / O*NET Canonical References
            </span>
          </div>
          <p className="text-xs text-ink-soft mt-0.5">
            These are preliminary inferences suggested by the engine. They are not yet verified capabilities. Review, accept, or correct them.
          </p>
        </div>

        <div className="space-y-4">
          {suggestions.map((sugg) => (
            <div key={sugg.id} className="rounded border border-line bg-paper p-4 text-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm text-ink">{sugg.suggested_skill_name}</h3>
                  {sugg.taxonomy_reference ? (
                    <p className="text-[10px] text-ink-soft font-mono">
                      Taxonomy: {sugg.taxonomy_reference}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-accent-soft px-2 py-0.5 text-[10px] text-ink border border-line font-medium">
                    Confidence: {Math.round((sugg.confidence_level || 0.8) * 100)}%
                  </span>
                  <span className="rounded bg-paper-raised px-2 py-0.5 text-[10px] text-ink uppercase border border-line font-semibold">
                    Review: {sugg.review_status}
                  </span>
                </div>
              </div>

              <p className="text-ink-soft leading-relaxed">
                <strong className="text-ink">Inference Explanation:</strong> {sugg.inference_explanation}
              </p>

              {sugg.supporting_evidence ? (
                <p className="text-[11px] text-ink-soft">
                  <strong className="text-ink">Supporting Evidence:</strong> {sugg.supporting_evidence}
                </p>
              ) : null}

              {/* Review Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-ink-soft">Your review:</span>
                  <button
                    type="button"
                    onClick={() => handleReviewSuggestion(sugg.id, "accepted")}
                    className={`rounded px-2.5 py-1 font-medium ${
                      sugg.review_status === "accepted"
                        ? "bg-ok text-paper-raised"
                        : "border border-line bg-paper-raised text-ink hover:border-ink"
                    }`}
                  >
                    Accept Suggestion
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewSuggestion(sugg.id, "rejected")}
                    className={`rounded px-2.5 py-1 font-medium ${
                      sugg.review_status === "rejected"
                        ? "bg-danger text-paper-raised"
                        : "border border-line bg-paper-raised text-ink hover:border-ink"
                    }`}
                  >
                    Reject Suggestion
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewSuggestion(sugg.id, "modified")}
                    className="rounded border border-line bg-paper-raised text-ink px-2.5 py-1 font-medium hover:border-ink"
                  >
                    Correct Explanation
                  </button>
                </div>

                <Link
                  href="/app/challenges"
                  className="text-xs text-accent font-medium hover:underline"
                >
                  Verify in Challenge Lab (Phase 5) →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-sm border border-line bg-paper-raised p-6 space-y-4 shadow-lg">
            <h3 className="font-serif text-xl text-ink">Add Observable Task</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-ink mb-1">Task Description</label>
                <input
                  type="text"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="e.g. Conducted daily volunteer safety briefings"
                  className="w-full rounded border border-line bg-paper p-2 text-ink text-sm"
                />
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">Action Type</label>
                <select
                  value={newTaskActionType}
                  onChange={(e) => setNewTaskActionType(e.target.value)}
                  className="w-full rounded border border-line bg-paper p-2 text-ink"
                >
                  <option value="coordination">Coordination</option>
                  <option value="communication">Communication</option>
                  <option value="technical">Technical</option>
                  <option value="operations">Operations</option>
                  <option value="problem_solving">Problem Solving</option>
                  <option value="teaching">Teaching</option>
                  <option value="analysis">Analysis</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-ink mb-1">Complexity</label>
                <select
                  value={newTaskComplexity}
                  onChange={(e) => setNewTaskComplexity(e.target.value as "low" | "medium" | "high")}
                  className="w-full rounded border border-line bg-paper p-2 text-ink"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <Button variant="secondary" onClick={() => setShowAddTask(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTask} disabled={!newTaskDesc.trim() || isPending}>
                Save Task
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
