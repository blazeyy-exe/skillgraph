"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createConversationAction,
  updateConversationStatusAction,
  getConversationDetailsAction,
  reviewTaskAction,
  addTaskAction,
  deleteTaskAction,
  reviewSkillSuggestionAction,
} from "@/app/actions/discovery";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import type {
  DiscoveryConversation,
  DiscoveryMessage,
  Experience,
  ExperienceTask,
  SkillSuggestion,
  InterviewStage,
} from "@/types/database";
import type { InterviewAnalysis } from "@/lib/ai/discovery/schemas";

type MessageItem = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
};

export function DiscoveryChat({
  initialConversationId,
  initialMessages = [],
  initialConversations = [],
  initialExperience,
  initialTasks = [],
  initialSuggestions = [],
  initialStage = "initial",
  initialSummary = "",
}: {
  initialConversationId: string;
  initialMessages?: DiscoveryMessage[];
  initialConversations?: DiscoveryConversation[];
  initialExperience?: Experience;
  initialTasks?: ExperienceTask[];
  initialSuggestions?: SkillSuggestion[];
  initialStage?: InterviewStage;
  initialSummary?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Conversation state
  const [currentConversationId, setCurrentConversationId] = useState(initialConversationId);
  const [conversations, setConversations] = useState<DiscoveryConversation[]>(initialConversations);
  const [showConvList, setShowConvList] = useState(false);
  const [showSecondaryPanelMobile, setShowSecondaryPanelMobile] = useState(false);

  // Messages state
  const [messages, setMessages] = useState<MessageItem[]>(
    initialMessages.length > 0
      ? initialMessages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content }))
      : [
          {
            id: "welcome",
            role: "assistant",
            content:
              "Welcome to Experience Discovery. What is something real you have organized, built, resolved, learned, or helped with? Describe what happened and what role you personally played.",
          },
        ],
  );

  // Input & streaming state
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string>("");

  // Secondary Intelligence Panel state
  const [stage, setStage] = useState<InterviewStage>(initialStage);
  const [contextSummary, setContextSummary] = useState(initialSummary);
  const [knownInformation, setKnownInformation] = useState<string[]>([]);
  const [unclearPoints, setUnclearPoints] = useState<string[]>([]);
  const [missingInformation, setMissingInformation] = useState<string[]>([]);
  const [extractedExperience, setExtractedExperience] = useState<Experience | undefined>(initialExperience);
  const [tasks, setTasks] = useState<ExperienceTask[]>(initialTasks);
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>(initialSuggestions);
  const [followUpOptions, setFollowUpOptions] = useState<string[]>([
    "I organized a community workshop for 150 people with youth volunteers.",
    "I built a custom automation script to eliminate hours of manual entry.",
    "I resolved emergency supplier logistics during an unexpected outage.",
  ]);

  // Task adding modal state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskActionType, setNewTaskActionType] = useState("operations");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Switch conversation
  async function handleSwitchConversation(convId: string) {
    if (convId === currentConversationId || isStreaming) return;
    setStreamError(null);
    setCurrentConversationId(convId);
    setShowConvList(false);

    const details = await getConversationDetailsAction(convId);
    if (details.ok) {
      if (details.conversation) {
        setStage(details.conversation.current_interview_stage);
        setContextSummary(details.conversation.context_summary || "");
        const snapshot = details.conversation.context_snapshot as Record<string, unknown> | undefined;
        if (snapshot) {
          if (Array.isArray(snapshot.knownInformation)) setKnownInformation(snapshot.knownInformation as string[]);
          if (Array.isArray(snapshot.unclearPoints)) setUnclearPoints(snapshot.unclearPoints as string[]);
          if (Array.isArray(snapshot.missingInformation)) setMissingInformation(snapshot.missingInformation as string[]);
        }
      }
      setMessages(
        details.messages.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      );
      setExtractedExperience(details.experience);
      setTasks(details.tasks || []);
      setSuggestions(details.suggestions || []);
    }
  }

  // Create new conversation
  async function handleNewConversation() {
    if (isStreaming) return;
    const res = await createConversationAction();
    if (res.ok && res.conversationId) {
      setCurrentConversationId(res.conversationId);
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: "assistant",
          content:
            "Starting a new discovery. Tell me about something real you have organized, built, resolved, or handled. What happened and what did you personally do?",
        },
      ]);
      setStage("initial");
      setContextSummary("");
      setKnownInformation([]);
      setUnclearPoints([]);
      setMissingInformation([]);
      setExtractedExperience(undefined);
      setTasks([]);
      setSuggestions([]);
      setFollowUpOptions([
        "I organized a community workshop for 150 people with youth volunteers.",
        "I built a custom automation script to eliminate hours of manual entry.",
        "I resolved emergency supplier logistics during an unexpected outage.",
      ]);
      router.refresh();
    }
  }

  // Send message via streaming Route Handler
  async function handleSendMessage(overrideText?: string, forceExtraction = false) {
    const textToSend = (overrideText || input).trim();
    if (!textToSend || isStreaming) return;

    setStreamError(null);
    setInput("");
    setLastUserMessage(textToSend);
    setIsStreaming(true);

    const tempUserId = `user-${Date.now()}`;
    const tempAssistantId = `assistant-${Date.now()}`;

    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      { id: tempUserId, role: "user", content: textToSend },
      { id: tempAssistantId, role: "assistant", content: "", isStreaming: true },
    ]);

    try {
      const response = await fetch("/api/discovery/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: currentConversationId,
          message: textToSend,
          forceExtraction,
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || `Request failed (${response.status})`);
      }

      if (!response.body) {
        throw new Error("No response body received from stream.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedAssistantText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));

            if (parsed.type === "token") {
              streamedAssistantText += parsed.data;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempAssistantId
                    ? { ...m, content: streamedAssistantText }
                    : m,
                ),
              );
            } else if (parsed.type === "meta") {
              const meta = parsed.data;
              if (meta.interviewAnalysis) {
                const a: InterviewAnalysis = meta.interviewAnalysis;
                setStage(a.currentStage);
                setContextSummary(a.contextSummary);
                if (a.knownInformation) setKnownInformation(a.knownInformation);
                if (a.unclearPoints) setUnclearPoints(a.unclearPoints);
                if (a.missingInformation) setMissingInformation(a.missingInformation);
                if (a.suggestedFollowUpOptions && a.suggestedFollowUpOptions.length > 0) {
                  setFollowUpOptions(a.suggestedFollowUpOptions);
                }
              }

              if (meta.extractedExperience) {
                const ext = meta.extractedExperience;
                setExtractedExperience(ext.experience);
                setTasks(ext.tasks || []);
                setSuggestions(ext.suggestions || []);
              }
            } else if (parsed.type === "error") {
              setStreamError(parsed.data.error || "Streaming error encountered.");
            }
          } catch {
            // ignore non-json SSE lines
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempAssistantId ? { ...m, isStreaming: false } : m,
        ),
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect to Discovery Intelligence.";
      setStreamError(msg);
      // Remove empty streaming bubble if it failed immediately
      setMessages((prev) =>
        prev.filter((m) => !(m.id === tempAssistantId && !m.content)),
      );
    } finally {
      setIsStreaming(false);
    }
  }

  // User review for Tasks
  async function handleReviewTask(
    taskId: string,
    reviewStatus: "accepted" | "rejected" | "modified",
  ) {
    let description: string | undefined;
    if (reviewStatus === "modified") {
      const current = tasks.find((t) => t.id === taskId)?.description || "";
      const entered = window.prompt("Edit task description:", current);
      if (!entered || !entered.trim()) return;
      description = entered.trim();
    }

    startTransition(async () => {
      await reviewTaskAction({ taskId, userReviewStatus: reviewStatus, description });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                user_review_status: reviewStatus,
                ...(description ? { description } : {}),
              }
            : t,
        ),
      );
    });
  }

  // Add missing task
  async function handleAddTask() {
    if (!newTaskDesc.trim() || !extractedExperience) return;
    startTransition(async () => {
      const res = await addTaskAction({
        experienceId: extractedExperience.id,
        description: newTaskDesc.trim(),
        actionType: newTaskActionType,
      });

      if (res.ok && res.task) {
        setTasks((prev) => [...prev, res.task!]);
        setNewTaskDesc("");
        setShowAddTaskModal(false);
      }
    });
  }

  // Delete task
  async function handleDeleteTask(taskId: string) {
    if (!confirm("Are you sure you want to remove this task?")) return;
    startTransition(async () => {
      await deleteTaskAction(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    });
  }

  // User review for Skill Suggestions
  async function handleReviewSuggestion(
    suggestionId: string,
    reviewStatus: "accepted" | "rejected" | "modified",
  ) {
    let correctedExplanation: string | undefined;
    if (reviewStatus === "modified") {
      const current = suggestions.find((s) => s.id === suggestionId)?.inference_explanation || "";
      const entered = window.prompt("Enter your correction or explanation:", current);
      if (!entered || !entered.trim()) return;
      correctedExplanation = entered.trim();
    }

    startTransition(async () => {
      await reviewSkillSuggestionAction({
        suggestionId,
        reviewStatus,
        correctedExplanation,
      });

      setSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestionId
            ? {
                ...s,
                review_status: reviewStatus,
                ...(correctedExplanation
                  ? { inference_explanation: correctedExplanation }
                  : {}),
              }
            : s,
        ),
      );
    });
  }

  // Pause / Resume conversation status
  async function toggleConversationPause() {
    const activeConv = conversations.find((c) => c.id === currentConversationId);
    const newStatus = activeConv?.status === "paused" ? "active" : "paused";
    await updateConversationStatusAction(currentConversationId, newStatus);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConversationId ? { ...c, status: newStatus } : c,
      ),
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Action Bar: Conversation Switcher & Mobile Panel Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-line bg-paper-raised p-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowConvList(!showConvList)}
            className="rounded border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink hover:border-ink transition-colors"
          >
            Conversations ({conversations.length || 1}) ▾
          </button>
          <button
            type="button"
            onClick={handleNewConversation}
            className="rounded bg-accent text-paper-raised px-3 py-1.5 text-xs font-medium hover:bg-accent-hover transition-colors"
          >
            + New Interview
          </button>
          <button
            type="button"
            onClick={toggleConversationPause}
            className="rounded border border-line bg-paper px-2.5 py-1.5 text-[11px] text-ink-soft hover:text-ink"
            title="Pause or resume this interview session"
          >
            Status: <span className="font-semibold text-ink">{stage === "completed" ? "Completed" : "Active"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Secondary Panel Toggle */}
          <button
            type="button"
            onClick={() => setShowSecondaryPanelMobile(!showSecondaryPanelMobile)}
            className="sm:hidden rounded border border-line bg-paper px-3 py-1.5 text-xs font-medium text-accent"
          >
            {showSecondaryPanelMobile ? "Hide Signals" : "View Intelligence Signals ▾"}
          </button>

          {/* Quick Trigger to extract when ready */}
          {stage !== "completed" && messages.length >= 3 && !extractedExperience ? (
            <button
              type="button"
              onClick={() => handleSendMessage("Please summarize and structure my experience now.", true)}
              disabled={isStreaming}
              className="rounded border border-ok bg-paper px-3 py-1.5 text-xs font-semibold text-ok hover:bg-paper-raised transition-colors"
            >
              Structure Experience Now ➔
            </button>
          ) : null}
        </div>
      </div>

      {/* Conversation List Dropdown Drawer */}
      {showConvList ? (
        <div className="rounded-sm border border-line bg-paper p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft mb-2">
            Interview History &amp; Resumption
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSwitchConversation(c.id)}
                className={`text-left rounded border p-3 text-xs transition-colors ${
                  c.id === currentConversationId
                    ? "border-accent bg-paper-raised text-ink font-semibold"
                    : "border-line bg-paper text-ink-soft hover:border-ink"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-ink">{c.title || "Interview Session"}</span>
                  <span className="text-[10px] uppercase tracking-wider text-accent">
                    {c.current_interview_stage || c.status}
                  </span>
                </div>
                <p className="text-[11px] text-ink-soft line-clamp-1">
                  {c.context_summary || "Session in progress..."}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Main Grid: Left Chat Column + Right Secondary Intelligence Panel */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Chat Conversation (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Quick Prompts Starters */}
          {messages.length <= 1 ? (
            <div className="rounded-sm border border-line bg-paper-raised p-4">
              <p className="text-xs uppercase tracking-wider text-ink-soft mb-2 font-semibold">
                Real Scenario Starters
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {followUpOptions.map((starter, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(starter)}
                    className="text-left rounded border border-line bg-paper p-3 text-xs text-ink hover:border-ink transition-colors leading-relaxed"
                  >
                    “{starter}”
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Messages Container */}
          <div className="space-y-4 max-h-[680px] overflow-y-auto pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-sm border p-4 transition-all ${
                  m.role === "user"
                    ? "border-line bg-paper-raised ml-4 sm:ml-8"
                    : "border-line bg-paper mr-4 sm:mr-8"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                    {m.role === "user" ? "You" : "Discovery Interviewer"}
                  </span>
                  {m.isStreaming ? (
                    <span className="inline-block h-2 w-2 rounded-full bg-accent animate-ping" />
                  ) : null}
                </div>
                <div className="text-sm leading-relaxed text-ink whitespace-pre-wrap font-sans">
                  {m.content}
                </div>
              </div>
            ))}

            {isStreaming && (
              <div className="rounded-sm border border-line bg-paper p-4 mr-8 animate-pulse">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                  Discovery Interviewer
                </span>
                <p className="mt-1 text-xs text-ink-soft">
                  Investigating personal contribution, obstacles, and outcomes...
                </p>
              </div>
            )}

            {streamError && (
              <div className="rounded-sm border border-danger/40 bg-accent-soft/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-danger">{streamError}</p>
                  {lastUserMessage ? (
                    <button
                      type="button"
                      onClick={() => handleSendMessage(lastUserMessage)}
                      className="rounded bg-accent text-paper-raised px-2.5 py-1 text-xs font-medium hover:bg-accent-hover"
                    >
                      Retry Message ↺
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="rounded-sm border border-line bg-paper-raised p-4 space-y-3"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Describe what you built, organized, solved, learned, or helped with... (Enter to send, Shift+Enter for new line)"
              className="min-h-24 bg-paper text-sm"
              disabled={isStreaming}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-ink-soft">
                Focus on what <strong className="text-ink">you</strong> personally did, what obstacles arose, and the outcome.
              </p>
              <Button type="submit" disabled={isStreaming || !input.trim()}>
                {isStreaming ? "Analyzing..." : "Send Message"}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Secondary Intelligence Panel (5 cols on desktop, toggled or stacked on mobile) */}
        <div
          className={`lg:col-span-5 space-y-4 ${
            showSecondaryPanelMobile ? "block" : "hidden sm:block"
          }`}
        >
          {/* Intelligence Stage & Progress */}
          <div className="rounded-sm border border-line bg-paper-raised p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <h3 className="font-serif text-lg text-ink">Intelligence Progress</h3>
              <span className="rounded bg-paper px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent border border-line">
                Stage: {stage.replace(/_/g, " ")}
              </span>
            </div>

            {contextSummary ? (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-ink-soft font-semibold mb-1">
                  Current Understanding
                </p>
                <p className="text-xs text-ink leading-relaxed italic bg-paper p-2.5 rounded border border-line">
                  “{contextSummary}”
                </p>
              </div>
            ) : null}

            {/* Known vs Unclear Information Signals */}
            <div className="grid gap-3 sm:grid-cols-2 text-xs pt-1">
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-ok font-semibold">
                  Known Signals ({knownInformation.length})
                </p>
                {knownInformation.length > 0 ? (
                  <ul className="space-y-1">
                    {knownInformation.slice(0, 4).map((info, i) => (
                      <li key={i} className="text-ink-soft text-[11px] flex items-start gap-1">
                        <span className="text-ok">✓</span> {info}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-ink-soft">Interview in progress...</p>
                )}
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-accent font-semibold">
                  Points to Clarify ({unclearPoints.length + missingInformation.length})
                </p>
                {unclearPoints.length > 0 || missingInformation.length > 0 ? (
                  <ul className="space-y-1">
                    {[...unclearPoints, ...missingInformation].slice(0, 4).map((point, i) => (
                      <li key={i} className="text-ink-soft text-[11px] flex items-start gap-1">
                        <span className="text-accent">?</span> {point}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-ink-soft">No outstanding contradictions.</p>
                )}
              </div>
            </div>
          </div>

          {/* Extracted Experience Card */}
          {extractedExperience ? (
            <div className="rounded-sm border border-line bg-paper-raised p-4 space-y-4">
              <div className="border-b border-line pb-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ok">
                    Structured Experience
                  </span>
                  <span className="text-[11px] rounded bg-paper px-2 py-0.5 text-ink-soft border border-line">
                    {extractedExperience.experience_type || extractedExperience.category}
                  </span>
                </div>
                <h4 className="font-serif text-xl text-ink mt-1">
                  {extractedExperience.title}
                </h4>
                {extractedExperience.user_contribution ? (
                  <p className="text-xs text-ink-soft mt-1">
                    <strong className="text-ink">Personal Role:</strong> {extractedExperience.user_contribution}
                  </p>
                ) : null}
              </div>

              {/* Decomposed Tasks Review */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-ink">
                    Observable Tasks ({tasks.length})
                  </h5>
                  <button
                    type="button"
                    onClick={() => setShowAddTaskModal(true)}
                    className="text-[11px] text-accent hover:underline font-medium"
                  >
                    + Add Task
                  </button>
                </div>

                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded border border-line bg-paper p-3 text-xs space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-ink leading-snug">{task.description}</p>
                        <span className="rounded bg-paper-raised px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-ink-soft border border-line whitespace-nowrap">
                          {task.user_review_status || "pending"}
                        </span>
                      </div>

                      {task.action_type ? (
                        <p className="text-[10px] text-ink-soft">
                          <strong className="text-ink">Action type:</strong> {task.action_type}
                        </p>
                      ) : null}

                      {/* Interactive Review Controls */}
                      <div className="flex items-center gap-2 pt-1 border-t border-line text-[10px]">
                        <button
                          type="button"
                          onClick={() => handleReviewTask(task.id, "accepted")}
                          className="rounded bg-ok text-paper-raised px-2 py-0.5 font-medium hover:opacity-90"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewTask(task.id, "modified")}
                          className="rounded border border-line bg-paper-raised px-2 py-0.5 text-ink hover:border-ink"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="rounded border border-line bg-paper-raised px-2 py-0.5 text-danger hover:border-danger"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preliminary Skill Suggestions */}
              <div className="space-y-2 pt-2 border-t border-line">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-accent">
                    Potential Skill Suggestions ({suggestions.length})
                  </h5>
                </div>
                <p className="text-[10px] text-ink-soft italic">
                  Note: Preliminary AI inferences. Not yet verified capability.
                </p>

                <div className="space-y-2">
                  {suggestions.map((sugg) => (
                    <div
                      key={sugg.id}
                      className="rounded border border-line bg-paper p-3 text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-ink text-sm">
                            {sugg.suggested_skill_name}
                          </p>
                          {sugg.taxonomy_reference ? (
                            <p className="text-[10px] text-ink-soft font-mono">
                              Taxonomy: {sugg.taxonomy_reference}
                            </p>
                          ) : null}
                        </div>
                        <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[9px] font-medium text-ink border border-line whitespace-nowrap">
                          {Math.round(sugg.confidence_level * 100)}% Confidence
                        </span>
                      </div>

                      <p className="text-ink-soft text-[11px] leading-relaxed">
                        {sugg.inference_explanation}
                      </p>

                      <div className="flex items-center gap-2 pt-1 border-t border-line text-[10px]">
                        <span className="text-ink-soft">Review:</span>
                        <button
                          type="button"
                          onClick={() => handleReviewSuggestion(sugg.id, "accepted")}
                          className={`rounded px-2 py-0.5 font-medium ${
                            sugg.review_status === "accepted"
                              ? "bg-ok text-paper-raised"
                              : "border border-line bg-paper-raised text-ink hover:border-ink"
                          }`}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewSuggestion(sugg.id, "rejected")}
                          className={`rounded px-2 py-0.5 font-medium ${
                            sugg.review_status === "rejected"
                              ? "bg-danger text-paper-raised"
                              : "border border-line bg-paper-raised text-ink hover:border-ink"
                          }`}
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewSuggestion(sugg.id, "modified")}
                          className="rounded border border-line bg-paper-raised px-2 py-0.5 text-ink hover:border-ink"
                        >
                          Correct
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-sm border border-line bg-paper p-6 text-center text-xs text-ink-soft">
              <p className="font-medium text-ink mb-1">No Experience Structured Yet</p>
              <p className="leading-relaxed">
                Describe your real-world activities in the chat. When enough detail is shared, your experience will be decomposed into reviewable tasks and skill suggestions here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Missing Task */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-sm border border-line bg-paper-raised p-6 space-y-4 shadow-lg">
            <h3 className="font-serif text-xl text-ink">Add Missing Task</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-ink mb-1">Task Description</label>
                <input
                  type="text"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="e.g. Conducted daily equipment inspections"
                  className="w-full rounded border border-line bg-paper p-2 text-ink"
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
                  <option value="analysis">Analysis</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <Button variant="secondary" onClick={() => setShowAddTaskModal(false)}>
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
