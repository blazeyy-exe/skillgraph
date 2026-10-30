import "server-only";
import { DiscoveryOrchestrator, type DiscoveryTurnResult } from "./discovery/discovery-orchestrator";
import type { Experience, ExperienceTask, SkillClaim } from "@/types/database";

export type DiscoveryResponse = {
  reply: string;
  followUpQuestions: string[];
  extractedExperience?: {
    experience: Experience;
    tasks: ExperienceTask[];
    claims: SkillClaim[];
  };
};

/**
 * Backwards-compatible export wrapping the modular Discovery Orchestrator.
 */
export async function processDiscoveryMessage({
  conversationId,
  userMessage,
  userId,
}: {
  conversationId: string;
  userMessage: string;
  userId: string;
}): Promise<DiscoveryResponse> {
  const result: DiscoveryTurnResult = await DiscoveryOrchestrator.processTurn({
    conversationId,
    userMessage,
    userId,
  });

  return {
    reply: result.reply,
    followUpQuestions: result.interviewAnalysis.suggestedFollowUpOptions.length > 0
      ? result.interviewAnalysis.suggestedFollowUpOptions
      : [result.nextQuestion],
    extractedExperience: result.extractedExperience
      ? {
          experience: result.extractedExperience.experience,
          tasks: result.extractedExperience.tasks,
          claims: result.extractedExperience.claims,
        }
      : undefined,
  };
}
