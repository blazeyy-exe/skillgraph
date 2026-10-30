import "server-only";
import { getAiProvider } from "@/lib/ai/provider";
import { DISCOVERY_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { DiscoveryAgentOutputSchema, type DiscoveryAgentOutput } from "@/lib/ai/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/config";
import type { DiscoveryMessage, Experience, ExperienceTask, SkillClaim } from "@/types/database";

export type DiscoveryResponse = {
  reply: string;
  followUpQuestions: string[];
  extractedExperience?: {
    experience: Experience;
    tasks: ExperienceTask[];
    claims: SkillClaim[];
  };
};

export async function processDiscoveryMessage({
  conversationId,
  userMessage,
  userId,
}: {
  conversationId: string;
  userMessage: string;
  userId: string;
}): Promise<DiscoveryResponse> {
  const supabase = await createSupabaseServerClient();
  const provider = getAiProvider();

  // Retrieve prior messages for conversational context
  let historyText = "";
  if (supabase) {
    const { data: messages } = await supabase
      .from("discovery_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(10);

    if (messages && messages.length > 0) {
      historyText = messages
        .map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n\n");
    }

    // Record user message
    await supabase.from("discovery_messages").insert({
      conversation_id: conversationId,
      user_id: userId,
      role: "user",
      content: userMessage,
    });
  }

  const promptInput = historyText
    ? `PREVIOUS CONVERSATION CONTEXT:\n${historyText}\n\nLATEST USER INPUT:\n${userMessage}`
    : `USER INPUT:\n${userMessage}`;

  const aiResult = await provider.generateStructured<DiscoveryAgentOutput>(
    {
      operation: "discovery",
      promptVersion: "v1.0",
      system: DISCOVERY_SYSTEM_PROMPT,
      user: promptInput,
      userId,
    },
    DiscoveryAgentOutputSchema,
  );

  const output = aiResult.data;

  // Record assistant response
  if (supabase) {
    await supabase.from("discovery_messages").insert({
      conversation_id: conversationId,
      user_id: userId,
      role: "assistant",
      content: output.reply,
      metadata: {
        followUpQuestions: output.followUpQuestions,
        hasExtraction: Boolean(output.extractedExperience),
        model: aiResult.model,
      },
    });
  }

  // If an experience was extracted, persist it into experiences, tasks, and skill claims
  if (output.extractedExperience && supabase) {
    const ext = output.extractedExperience;

    // 1. Insert experience
    const { data: expData, error: expErr } = await supabase
      .from("experiences")
      .insert({
        user_id: userId,
        title: ext.title,
        narrative: userMessage,
        source: "conversation",
        status: "extracted",
        category: ext.category,
        role_or_contribution: ext.roleOrContribution || null,
      })
      .select("*")
      .single();

    if (!expErr && expData) {
      const savedExperience = expData as Experience;

      // 2. Insert tasks
      const taskInserts = ext.tasks.map((t, idx) => ({
        experience_id: savedExperience.id,
        user_id: userId,
        description: t.description,
        contribution_type: t.contributionType,
        actions: t.actions,
        tools: t.tools,
        obstacles: t.obstacles,
        outcomes: t.outcomes,
        order_index: idx,
      }));

      const { data: tasksData } = await supabase
        .from("experience_tasks")
        .insert(taskInserts)
        .select("*");

      const savedTasks = (tasksData as ExperienceTask[]) || [];
      const taskIds = savedTasks.map((t) => t.id);

      // 3. Map inferred skills to skill_claims
      const savedClaims: SkillClaim[] = [];

      for (const inferred of ext.inferredSkills) {
        // Find existing skill by canonical_id
        let { data: skill } = await supabase
          .from("skills")
          .select("*")
          .eq("canonical_id", inferred.skillCanonicalId)
          .maybeSingle();

        if (!skill) {
          // If skill taxonomy doesn't have it yet, dynamically register it
          const { data: newSkill } = await supabase
            .from("skills")
            .insert({
              canonical_id: inferred.skillCanonicalId,
              name: inferred.skillName,
              description: inferred.explanation,
              category: ext.category,
              source: "esco",
            })
            .select("*")
            .single();
          skill = newSkill;
        }

        if (skill) {
          const { data: claimData } = await supabase
            .from("skill_claims")
            .insert({
              user_id: userId,
              skill_id: skill.id,
              evidence_state: "inferred",
              user_review: "pending",
              evidence_confidence: inferred.confidence,
              evidence_coverage: 0.5,
              inference_explanation: inferred.explanation,
              source_experience_ids: [savedExperience.id],
              source_task_ids: taskIds,
            })
            .select("*, skill:skills(*)")
            .single();

          if (claimData) {
            savedClaims.push(claimData as SkillClaim);
          }
        }
      }

      return {
        reply: output.reply,
        followUpQuestions: output.followUpQuestions,
        extractedExperience: {
          experience: savedExperience,
          tasks: savedTasks,
          claims: savedClaims,
        },
      };
    }
  }

  // Handle demo mode fallback when Supabase is not connected
  if (output.extractedExperience && isDemoMode() && !supabase) {
    const ext = output.extractedExperience;
    const mockExpId = `demo-exp-${Date.now()}`;
    const demoExp: Experience = {
      id: mockExpId,
      user_id: userId,
      title: ext.title,
      narrative: userMessage,
      source: "conversation",
      status: "extracted",
      category: ext.category,
      role_or_contribution: ext.roleOrContribution || null,
      occurred_at: "Recent",
      location: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const demoTasks: ExperienceTask[] = ext.tasks.map((t, idx) => ({
      id: `demo-task-${idx}`,
      experience_id: mockExpId,
      user_id: userId,
      description: t.description,
      contribution_type: t.contributionType,
      actions: t.actions,
      tools: t.tools,
      obstacles: t.obstacles,
      outcomes: t.outcomes,
      order_index: idx,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const demoClaims: SkillClaim[] = ext.inferredSkills.map((s, idx) => ({
      id: `demo-claim-${idx}`,
      user_id: userId,
      skill_id: `demo-skill-${idx}`,
      evidence_state: "inferred",
      user_review: "pending",
      evidence_confidence: s.confidence,
      proficiency_level: "intermediate",
      evidence_coverage: 0.6,
      inference_explanation: s.explanation,
      source_experience_ids: [mockExpId],
      source_task_ids: demoTasks.map((t) => t.id),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      skill: {
        id: `demo-skill-${idx}`,
        canonical_id: s.skillCanonicalId,
        name: s.skillName,
        description: s.explanation,
        category: ext.category,
        observable_behaviours: [],
        source: "esco",
        source_ref: null,
        created_at: new Date().toISOString(),
      },
    }));

    return {
      reply: output.reply,
      followUpQuestions: output.followUpQuestions,
      extractedExperience: {
        experience: demoExp,
        tasks: demoTasks,
        claims: demoClaims,
      },
    };
  }

  return {
    reply: output.reply,
    followUpQuestions: output.followUpQuestions,
  };
}
