import "server-only";
import type { DiscoveryMessage, DiscoveryConversation, InterviewStage } from "@/types/database";

export type ConversationContext = {
  conversationId: string;
  userId: string;
  stage: InterviewStage;
  contextSummary: string;
  knownInformation: string[];
  unclearPoints: string[];
  missingInformation: string[];
  recentMessages: { role: string; content: string }[];
};

export class DiscoveryContextManager {
  /**
   * Sanitizes untrusted user input to prevent prompt injection and instruction override.
   */
  static sanitizeUserInput(input: string): string {
    const trimmed = input.trim();
    // Neutralize common instruction-override patterns while preserving meaning
    return trimmed
      .replace(/^(system|assistant|user):\s*/gi, "")
      .replace(/\b(ignore previous instructions|disregard earlier prompts)\b/gi, "[filtered prompt directive]")
      .slice(0, 4000); // hard cap length per turn
  }

  /**
   * Builds formatted conversation history for prompt injection, adhering to token budget.
   */
  static formatHistoryForPrompt(
    messages: DiscoveryMessage[],
    maxMessages = 12,
  ): string {
    // Filter out system instructions from normal conversational history
    const userFacingMessages = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-maxMessages);

    if (userFacingMessages.length === 0) {
      return "";
    }

    return userFacingMessages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");
  }

  /**
   * Merges newly discovered facts into accumulated known information without duplication.
   */
  static mergeKnownFacts(existing: string[], incoming: string[]): string[] {
    const set = new Set(existing);
    for (const item of incoming) {
      if (item && item.trim().length > 3) {
        set.add(item.trim());
      }
    }
    return Array.from(set).slice(0, 25);
  }

  /**
   * Creates a snapshot of context to store in discovery_conversations.context_snapshot
   */
  static buildContextSnapshot(params: {
    stage: InterviewStage;
    contextSummary: string;
    knownInformation: string[];
    unclearPoints: string[];
    missingInformation: string[];
    isSufficientForExtraction: boolean;
  }): Record<string, unknown> {
    return {
      stage: params.stage,
      contextSummary: params.contextSummary,
      knownInformation: params.knownInformation,
      unclearPoints: params.unclearPoints,
      missingInformation: params.missingInformation,
      isSufficientForExtraction: params.isSufficientForExtraction,
      lastUpdated: new Date().toISOString(),
    };
  }
}
