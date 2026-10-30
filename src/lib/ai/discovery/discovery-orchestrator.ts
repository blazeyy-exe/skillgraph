import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/config";
import { log } from "@/lib/logging";
import { DiscoveryContextManager } from "./context-manager";
import { DiscoveryInterviewStrategy } from "./interview-strategy";
import { DiscoveryExperienceExtractor } from "./experience-extractor";
import { DiscoveryTaskDecomposer } from "./task-decomposer";
import { DiscoverySkillSuggester } from "./skill-suggester";
import type {
  InterviewAnalysis,
  ExtractedExperience,
  DecomposedTask,
  SkillSuggestion,
} from "./schemas";
import type {
  DiscoveryConversation,
  DiscoveryMessage,
  Experience,
  ExperienceTask,
  SkillSuggestion as DbSkillSuggestion,
  SkillClaim,
} from "@/types/database";

export type DiscoveryTurnResult = {
  reply: string;
  nextQuestion: string;
  interviewAnalysis: InterviewAnalysis;
  extractedExperience?: {
    experience: Experience;
    tasks: ExperienceTask[];
    suggestions: DbSkillSuggestion[];
    claims: SkillClaim[];
  };
};

export class DiscoveryOrchestrator {
  /**
   * Executes a complete discovery turn: receives a user message, manages context,
   * questions or extracts, and persists records to the database.
   */
  static async processTurn({
    conversationId,
    userMessage,
    userId,
    forceExtraction = false,
  }: {
    conversationId: string;
    userMessage: string;
    userId: string;
    forceExtraction?: boolean;
  }): Promise<DiscoveryTurnResult> {
    const supabase = await createSupabaseServerClient();
    const sanitizedInput = DiscoveryContextManager.sanitizeUserInput(userMessage);

    // 1. Fetch conversation and verify ownership
    let conversation: DiscoveryConversation | null = null;
    let priorMessages: DiscoveryMessage[] = [];

    if (supabase) {
      const { data: convData, error: convErr } = await supabase
        .from("discovery_conversations")
        .select("*")
        .eq("id", conversationId)
        .eq("user_id", userId)
        .maybeSingle();

      if (convErr || !convData) {
        throw new Error("Conversation not found or unauthorized access.");
      }
      conversation = convData as DiscoveryConversation;

      // Persist user message (never lost)
      await supabase.from("discovery_messages").insert({
        conversation_id: conversationId,
        user_id: userId,
        role: "user",
        content: sanitizedInput,
        structured_metadata: {},
      });

      // Fetch history (RLS automatically filters out system messages)
      const { data: msgData } = await supabase
        .from("discovery_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      priorMessages = (msgData as DiscoveryMessage[]) || [];
    } else {
      // Demo mode fallback message list
      priorMessages = [
        {
          id: `demo-msg-${Date.now()}`,
          conversation_id: conversationId,
          user_id: userId,
          role: "user",
          content: sanitizedInput,
          structured_metadata: {},
          created_at: new Date().toISOString(),
        },
      ];
    }

    // 2. Run Interview Strategy
    const interviewAnalysis = await DiscoveryInterviewStrategy.analyzeAndFormulateNextStep({
      conversationId,
      messages: priorMessages,
      latestUserMessage: sanitizedInput,
      userId,
      currentSnapshot: conversation?.context_snapshot,
    });

    // 3. Determine if ready for extraction
    const shouldExtract =
      forceExtraction ||
      interviewAnalysis.isSufficientForExtraction ||
      interviewAnalysis.currentStage === "ready_for_extraction";

    let extractionResult: DiscoveryTurnResult["extractedExperience"] = undefined;

    if (shouldExtract) {
      log.info("discovery_extraction_triggered", {
        conversationId,
        userId,
        reason: forceExtraction ? "forced" : "interview_sufficient",
      });

      // Step A: Extract Experience
      const extractedExp = await DiscoveryExperienceExtractor.extractExperience({
        messages: priorMessages,
        userId,
      });

      // Step B: Decompose into Tasks
      const decomposedTasks = await DiscoveryTaskDecomposer.decomposeExperience({
        experience: extractedExp,
        userId,
      });

      // Step C: Suggest Skills
      const skillSuggestions = await DiscoverySkillSuggester.suggestSkills({
        experience: extractedExp,
        tasks: decomposedTasks,
        userId,
      });

      // Step D: Persist to database if connected
      if (supabase) {
        // Insert experience
        const { data: expRow } = await supabase
          .from("experiences")
          .insert({
            user_id: userId,
            conversation_id: conversationId,
            title: extractedExp.title,
            description: extractedExp.description,
            experience_type: extractedExp.experienceType,
            organization_name: extractedExp.organizationName,
            start_date: extractedExp.startDate,
            end_date: extractedExp.endDate,
            user_contribution: extractedExp.userContribution,
            challenges: extractedExp.challenges,
            outcomes: extractedExp.outcomes,
            tools_used: extractedExp.toolsUsed,
            status: "extracted",
          })
          .select("*")
          .single();

        const savedExp = expRow as Experience;

        // Insert tasks
        const taskInserts = decomposedTasks.map((t) => ({
          experience_id: savedExp.id,
          user_id: userId,
          description: t.description,
          action_type: t.actionType,
          tools_used: t.toolsUsed,
          complexity: t.complexity,
          responsibility_level: t.responsibilityLevel,
          supporting_context: t.supportingContext,
          extraction_source: "conversation",
          user_review_status: "pending",
        }));

        const { data: tasksRows } = await supabase
          .from("experience_tasks")
          .insert(taskInserts)
          .select("*");

        const savedTasks = (tasksRows as ExperienceTask[]) || [];

        // Insert skill suggestions and skill claims
        const savedSuggestions: DbSkillSuggestion[] = [];
        const savedClaims: SkillClaim[] = [];

        for (const sugg of skillSuggestions) {
          const matchingTask = savedTasks.find(
            (t) => t.description === sugg.supportingTaskDescription,
          );

          const { data: suggRow } = await supabase
            .from("skill_suggestions")
            .insert({
              user_id: userId,
              experience_id: savedExp.id,
              task_id: matchingTask ? matchingTask.id : null,
              suggested_skill_name: sugg.suggestedSkillName,
              skill_description: sugg.skillDescription,
              inference_explanation: sugg.inferenceExplanation,
              supporting_evidence: sugg.supportingEvidence,
              confidence_level: sugg.confidenceLevel,
              review_status: "pending",
              taxonomy_reference: sugg.taxonomyReference,
            })
            .select("*")
            .single();

          if (suggRow) {
            savedSuggestions.push(suggRow as DbSkillSuggestion);
          }

          // Also register or map to skills catalogue & skill_claims for Phase 3 graph
          const canonId = sugg.taxonomyReference || `custom:${sugg.suggestedSkillName.toLowerCase().replace(/\s+/g, "-")}`;
          let { data: catSkill } = await supabase
            .from("skills")
            .select("*")
            .eq("canonical_id", canonId)
            .maybeSingle();

          if (!catSkill) {
            const { data: newCat } = await supabase
              .from("skills")
              .insert({
                canonical_id: canonId,
                name: sugg.suggestedSkillName,
                description: sugg.skillDescription,
                category: extractedExp.experienceType,
                source: "esco",
              })
              .select("*")
              .single();
            catSkill = newCat;
          }

          if (catSkill) {
            const { data: claimRow } = await supabase
              .from("skill_claims")
              .insert({
                user_id: userId,
                skill_id: catSkill.id,
                evidence_state: "inferred",
                user_review: "pending",
                evidence_confidence: sugg.confidenceLevel,
                proficiency_level: "intermediate",
                evidence_coverage: 0.5,
                inference_explanation: sugg.inferenceExplanation,
                source_experience_ids: [savedExp.id],
                source_task_ids: savedTasks.map((t) => t.id),
              })
              .select("*, skill:skills(*)")
              .single();

            if (claimRow) {
              savedClaims.push(claimRow as SkillClaim);
            }
          }
        }

        extractionResult = {
          experience: savedExp,
          tasks: savedTasks,
          suggestions: savedSuggestions,
          claims: savedClaims,
        };
      } else if (isDemoMode()) {
        const demoExpId = `demo-exp-${Date.now()}`;
        const demoExp: Experience = {
          id: demoExpId,
          user_id: userId,
          conversation_id: conversationId,
          title: extractedExp.title,
          description: extractedExp.description,
          experience_type: extractedExp.experienceType,
          organization_name: extractedExp.organizationName,
          start_date: extractedExp.startDate,
          end_date: extractedExp.endDate,
          user_contribution: extractedExp.userContribution,
          challenges: extractedExp.challenges,
          outcomes: extractedExp.outcomes,
          tools_used: extractedExp.toolsUsed,
          status: "extracted",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const demoTasks: ExperienceTask[] = decomposedTasks.map((t, idx) => ({
          id: `demo-task-${idx}`,
          experience_id: demoExpId,
          user_id: userId,
          description: t.description,
          action_type: t.actionType,
          tools_used: t.toolsUsed,
          complexity: t.complexity,
          responsibility_level: t.responsibilityLevel,
          supporting_context: t.supportingContext,
          extraction_source: "conversation",
          user_review_status: "pending",
          contribution_type: "individual",
          actions: t.actions || [],
          tools: t.tools || [],
          obstacles: t.obstacles || [],
          outcomes: t.outcomes || [],
          order_index: idx,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const demoSuggestions: DbSkillSuggestion[] = skillSuggestions.map((s, idx) => ({
          id: `demo-sugg-${idx}`,
          user_id: userId,
          experience_id: demoExpId,
          task_id: `demo-task-${idx}`,
          suggested_skill_name: s.suggestedSkillName,
          skill_description: s.skillDescription,
          inference_explanation: s.inferenceExplanation,
          supporting_evidence: s.supportingEvidence,
          confidence_level: s.confidenceLevel,
          review_status: "pending",
          taxonomy_reference: s.taxonomyReference,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        const demoClaims: SkillClaim[] = skillSuggestions.map((s, idx) => ({
          id: `demo-claim-${idx}`,
          user_id: userId,
          skill_id: `demo-skill-${idx}`,
          evidence_state: "inferred",
          user_review: "pending",
          evidence_confidence: s.confidenceLevel,
          proficiency_level: "intermediate",
          evidence_coverage: 0.6,
          inference_explanation: s.inferenceExplanation,
          source_experience_ids: [demoExpId],
          source_task_ids: demoTasks.map((t) => t.id),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          skill: {
            id: `demo-skill-${idx}`,
            canonical_id: s.taxonomyReference || `demo:${idx}`,
            name: s.suggestedSkillName,
            description: s.skillDescription,
            category: extractedExp.experienceType,
            observable_behaviours: [],
            source: "esco",
            source_ref: null,
            created_at: new Date().toISOString(),
          },
        }));

        extractionResult = {
          experience: demoExp,
          tasks: demoTasks,
          suggestions: demoSuggestions,
          claims: demoClaims,
        };
      }
    }

    // 4. Update Conversation state & record assistant message
    const assistantContent = extractionResult
      ? `${interviewAnalysis.reply}\n\n**Identified Experience**: ${extractionResult.experience.title}\nI have structured your narrative into ${extractionResult.tasks.length} tasks and identified ${extractionResult.suggestions.length} potential skill suggestions for your review.`
      : interviewAnalysis.reply;

    if (supabase) {
      const newSnapshot = DiscoveryContextManager.buildContextSnapshot({
        stage: shouldExtract ? "completed" : interviewAnalysis.currentStage,
        contextSummary: interviewAnalysis.contextSummary,
        knownInformation: interviewAnalysis.knownInformation,
        unclearPoints: interviewAnalysis.unclearPoints,
        missingInformation: interviewAnalysis.missingInformation,
        isSufficientForExtraction: shouldExtract,
      });

      await supabase
        .from("discovery_conversations")
        .update({
          current_interview_stage: shouldExtract ? "completed" : interviewAnalysis.currentStage,
          context_summary: interviewAnalysis.contextSummary,
          context_snapshot: newSnapshot,
          updated_at: new Date().toISOString(),
          ...(shouldExtract ? { completed_at: new Date().toISOString() } : {}),
        })
        .eq("id", conversationId)
        .eq("user_id", userId);

      await supabase.from("discovery_messages").insert({
        conversation_id: conversationId,
        user_id: userId,
        role: "assistant",
        content: assistantContent,
        structured_metadata: {
          interviewAnalysis,
          hasExtraction: Boolean(extractionResult),
          experienceId: extractionResult?.experience.id,
        },
      });
    }

    return {
      reply: assistantContent,
      nextQuestion: interviewAnalysis.nextQuestion,
      interviewAnalysis,
      extractedExperience: extractionResult,
    };
  }
}
