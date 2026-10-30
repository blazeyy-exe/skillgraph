"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/config";
import { revalidatePath } from "next/cache";
import type {
  DiscoveryConversation,
  DiscoveryMessage,
  Experience,
  ExperienceTask,
  SkillSuggestion,
  SkillClaim,
} from "@/types/database";

export type MessageState = {
  ok: boolean;
  message?: string;
};

// 1. Conversation Management
export async function createConversationAction(
  title = "New Capability Discovery",
): Promise<{ ok: boolean; conversationId?: string; message?: string }> {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "You must be signed in." };
    }

    const { data, error } = await supabase
      .from("discovery_conversations")
      .insert({
        user_id: user.id,
        title,
        status: "active",
        current_interview_stage: "initial",
      })
      .select("id")
      .single();

    if (error || !data) {
      return { ok: false, message: error?.message || "Failed to create conversation." };
    }

    revalidatePath("/app/discover");
    return { ok: true, conversationId: data.id };
  }

  // Demo fallback
  return { ok: true, conversationId: `demo-conv-${Date.now()}` };
}

export async function listConversationsAction(): Promise<{
  ok: boolean;
  conversations: DiscoveryConversation[];
}> {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, conversations: [] };
    }

    const { data } = await supabase
      .from("discovery_conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    return { ok: true, conversations: (data as DiscoveryConversation[]) || [] };
  }

  if (isDemoMode()) {
    return {
      ok: true,
      conversations: [
        {
          id: "demo-conv-1",
          user_id: "demo-user-id",
          title: "Community Workshop Coordination",
          status: "active",
          context_summary: "Organized workshop sessions with volunteer logistics and merchant sponsorships.",
          current_interview_stage: "ready_for_extraction",
          context_snapshot: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: null,
        },
      ],
    };
  }

  return { ok: false, conversations: [] };
}

export async function updateConversationStatusAction(
  conversationId: string,
  status: "active" | "paused" | "completed" | "archived",
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "Unauthorized." };
    }

    const { error } = await supabase
      .from("discovery_conversations")
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...(status === "completed" ? { completed_at: new Date().toISOString() } : {}),
      })
      .eq("id", conversationId)
      .eq("user_id", user.id);

    if (error) {
      return { ok: false, message: error.message };
    }
  }

  revalidatePath("/app/discover");
  return { ok: true, message: `Conversation status updated to ${status}.` };
}

export async function getConversationDetailsAction(conversationId: string): Promise<{
  ok: boolean;
  conversation?: DiscoveryConversation;
  messages: DiscoveryMessage[];
  experience?: Experience;
  tasks?: ExperienceTask[];
  suggestions?: SkillSuggestion[];
  message?: string;
}> {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, messages: [], message: "Unauthorized." };
    }

    const { data: conv } = await supabase
      .from("discovery_conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!conv) {
      return { ok: false, messages: [], message: "Conversation not found." };
    }

    // Role != 'system' is enforced both by RLS and client query filter
    const { data: msgs } = await supabase
      .from("discovery_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .neq("role", "system")
      .order("created_at", { ascending: true });

    // Find if an experience was extracted for this conversation
    const { data: exp } = await supabase
      .from("experiences")
      .select("*")
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)
      .maybeSingle();

    let tasks: ExperienceTask[] = [];
    let suggestions: SkillSuggestion[] = [];

    if (exp) {
      const [{ data: tasksData }, { data: suggData }] = await Promise.all([
        supabase
          .from("experience_tasks")
          .select("*")
          .eq("experience_id", exp.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("skill_suggestions")
          .select("*")
          .eq("experience_id", exp.id),
      ]);

      tasks = (tasksData as ExperienceTask[]) || [];
      suggestions = (suggData as SkillSuggestion[]) || [];
    }

    return {
      ok: true,
      conversation: conv as DiscoveryConversation,
      messages: (msgs as DiscoveryMessage[]) || [],
      experience: (exp as Experience) || undefined,
      tasks,
      suggestions,
    };
  }

  // Demo fallback
  return {
    ok: true,
    messages: [],
  };
}

// 2. User Review & Correction Actions

export async function reviewTaskAction({
  taskId,
  userReviewStatus,
  description,
  actionType,
}: {
  taskId: string;
  userReviewStatus: "accepted" | "rejected" | "modified";
  description?: string;
  actionType?: string;
}): Promise<{ ok: boolean; message: string }> {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "Unauthorized." };
    }

    const updatePayload: Record<string, unknown> = {
      user_review_status: userReviewStatus,
      updated_at: new Date().toISOString(),
    };

    if (description) updatePayload.description = description.trim();
    if (actionType) updatePayload.action_type = actionType;

    const { error } = await supabase
      .from("experience_tasks")
      .update(updatePayload)
      .eq("id", taskId)
      .eq("user_id", user.id);

    if (error) {
      return { ok: false, message: error.message };
    }
  }

  revalidatePath("/app/experiences");
  revalidatePath("/app/discover");
  return { ok: true, message: `Task marked as ${userReviewStatus}.` };
}

export async function addTaskAction({
  experienceId,
  description,
  actionType = "operations",
  toolsUsed = [],
  complexity = "medium",
  responsibilityLevel = "individual_contributor",
  supportingContext = "",
}: {
  experienceId: string;
  description: string;
  actionType?: string;
  toolsUsed?: string[];
  complexity?: "low" | "medium" | "high";
  responsibilityLevel?: "supporting" | "individual_contributor" | "lead" | "owner";
  supportingContext?: string;
}): Promise<{ ok: boolean; task?: ExperienceTask; message?: string }> {
  const supabase = await createSupabaseServerClient();

  if (!description || !description.trim()) {
    return { ok: false, message: "Task description cannot be empty." };
  }

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "Unauthorized." };
    }

    const { data, error } = await supabase
      .from("experience_tasks")
      .insert({
        experience_id: experienceId,
        user_id: user.id,
        description: description.trim(),
        action_type: actionType,
        tools_used: toolsUsed,
        complexity,
        responsibility_level: responsibilityLevel,
        supporting_context: supportingContext,
        extraction_source: "user_added",
        user_review_status: "accepted",
      })
      .select("*")
      .single();

    if (error) {
      return { ok: false, message: error.message };
    }

    revalidatePath("/app/experiences");
    return { ok: true, task: data as ExperienceTask };
  }

  return { ok: true, message: "Task created." };
}

export async function deleteTaskAction(taskId: string): Promise<{ ok: boolean; message: string }> {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "Unauthorized." };
    }

    const { error } = await supabase
      .from("experience_tasks")
      .delete()
      .eq("id", taskId)
      .eq("user_id", user.id);

    if (error) {
      return { ok: false, message: error.message };
    }
  }

  revalidatePath("/app/experiences");
  revalidatePath("/app/discover");
  return { ok: true, message: "Task removed." };
}

export async function reviewSkillSuggestionAction({
  suggestionId,
  reviewStatus,
  correctedExplanation,
}: {
  suggestionId: string;
  reviewStatus: "accepted" | "rejected" | "modified";
  correctedExplanation?: string;
}): Promise<{ ok: boolean; message: string }> {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "Unauthorized." };
    }

    const updatePayload: Record<string, unknown> = {
      review_status: reviewStatus,
      updated_at: new Date().toISOString(),
    };

    if (correctedExplanation) {
      updatePayload.inference_explanation = correctedExplanation.trim();
    }

    const { error } = await supabase
      .from("skill_suggestions")
      .update(updatePayload)
      .eq("id", suggestionId)
      .eq("user_id", user.id);

    if (error) {
      return { ok: false, message: error.message };
    }
  }

  revalidatePath("/app/experiences");
  revalidatePath("/app/discover");
  return { ok: true, message: `Skill suggestion marked as ${reviewStatus}.` };
}

export async function updateExperienceAction({
  experienceId,
  title,
  userContribution,
  challenges,
  outcomes,
  toolsUsed,
}: {
  experienceId: string;
  title?: string;
  userContribution?: string;
  challenges?: string[];
  outcomes?: string[];
  toolsUsed?: string[];
}): Promise<{ ok: boolean; message: string }> {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "Unauthorized." };
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (title) updatePayload.title = title.trim();
    if (userContribution) updatePayload.user_contribution = userContribution.trim();
    if (challenges) updatePayload.challenges = challenges;
    if (outcomes) updatePayload.outcomes = outcomes;
    if (toolsUsed) updatePayload.tools_used = toolsUsed;

    const { error } = await supabase
      .from("experiences")
      .update(updatePayload)
      .eq("id", experienceId)
      .eq("user_id", user.id);

    if (error) {
      return { ok: false, message: error.message };
    }
  }

  revalidatePath("/app/experiences");
  revalidatePath("/app/discover");
  return { ok: true, message: "Experience successfully updated." };
}

// Backwards-compatible legacy review claim action
export async function reviewClaimAction({
  claimId,
  decision,
  correction,
}: {
  claimId: string;
  decision: "accepted" | "rejected" | "corrected";
  correction?: string;
}): Promise<{ ok: boolean; message: string }> {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "Unauthorized." };
    }

    const updatePayload: Record<string, unknown> = {
      user_review: decision,
      evidence_state:
        decision === "rejected"
          ? "unexplored"
          : decision === "accepted"
            ? "inferred"
            : "developing",
    };

    if (decision === "corrected" && correction) {
      updatePayload.inference_explanation = correction;
    }

    await supabase
      .from("skill_claims")
      .update(updatePayload)
      .eq("id", claimId)
      .eq("user_id", user.id);
  }

  revalidatePath("/app/experiences");
  revalidatePath("/app/discover");
  return { ok: true, message: `Claim marked as ${decision}.` };
}

export async function sendMessageAction(
  conversationId: string,
  content: string,
): Promise<{ ok: boolean; message?: string }> {
  // Legacy stub forwarding to database insert
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && content.trim()) {
      await supabase.from("discovery_messages").insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: "user",
        content: content.trim(),
        structured_metadata: {},
      });
    }
  }
  return { ok: true };
}
