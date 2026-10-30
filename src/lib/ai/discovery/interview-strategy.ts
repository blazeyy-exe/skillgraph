import "server-only";
import { getAiProvider } from "@/lib/ai/provider";
import { INTERVIEW_STRATEGY_SYSTEM_PROMPT, DISCOVERY_PROMPT_VERSION } from "./prompts";
import { InterviewAnalysisSchema, type InterviewAnalysis } from "./schemas";
import { DiscoveryContextManager } from "./context-manager";
import type { DiscoveryMessage } from "@/types/database";

export class DiscoveryInterviewStrategy {
  /**
   * Analyzes conversation context and produces the next interview step.
   */
  static async analyzeAndFormulateNextStep({
    conversationId,
    messages,
    latestUserMessage,
    userId,
    currentSnapshot,
  }: {
    conversationId: string;
    messages: DiscoveryMessage[];
    latestUserMessage: string;
    userId: string;
    currentSnapshot?: Record<string, unknown>;
  }): Promise<InterviewAnalysis> {
    const provider = getAiProvider();
    const sanitizedInput = DiscoveryContextManager.sanitizeUserInput(latestUserMessage);
    const historyText = DiscoveryContextManager.formatHistoryForPrompt(messages, 10);

    const promptContext = `
PRIOR CONVERSATION HISTORY:
${historyText || "No prior messages. This is the first interaction."}

PREVIOUS CONTEXT SUMMARY:
${(currentSnapshot?.contextSummary as string) || "None yet."}

LATEST USER INPUT:
${sanitizedInput}
`.trim();

    try {
      const result = await provider.generateStructured<InterviewAnalysis>(
        {
          operation: "discovery.interview_strategy",
          promptVersion: DISCOVERY_PROMPT_VERSION,
          system: INTERVIEW_STRATEGY_SYSTEM_PROMPT,
          user: promptContext,
          userId,
        },
        InterviewAnalysisSchema,
      );

      return result.data;
    } catch {
      // Intelligent fallback when AI provider returns unconfigured or in testing
      return this.heuristicFallbackAnalysis(sanitizedInput, messages.length);
    }
  }

  /**
   * Fallback heuristic analysis for demo mode and graceful error recovery.
   */
  static heuristicFallbackAnalysis(
    userInput: string,
    historyLength: number,
  ): InterviewAnalysis {
    const lower = userInput.toLowerCase();
    const isLogistics =
      lower.includes("event") ||
      lower.includes("organize") ||
      lower.includes("volunteer") ||
      lower.includes("workshop");
    const isTech =
      lower.includes("code") ||
      lower.includes("software") ||
      lower.includes("build") ||
      lower.includes("automation") ||
      lower.includes("system");

    const hasSpecificDetails =
      userInput.length > 80 ||
      lower.includes("because") ||
      lower.includes("resolved") ||
      lower.includes("managed") ||
      lower.includes("helped");

    const isSufficient = historyLength >= 3 && hasSpecificDetails;

    if (isLogistics) {
      return {
        knownInformation: ["Organized community or event initiative", "Involved other participants or volunteers"],
        unclearPoints: historyLength < 2 ? ["Exact personal responsibilities vs team tasks"] : [],
        missingInformation: historyLength < 2 ? ["Obstacles encountered during the initiative"] : [],
        contradictoryPoints: [],
        currentStage: isSufficient ? "ready_for_extraction" : "investigating_tasks",
        isSufficientForExtraction: isSufficient,
        contextSummary: "Community coordination and logistics initiative involving volunteer scheduling and venue execution.",
        reply: isSufficient
          ? "Thank you for detailing your role and how you handled those challenges. We now have enough concrete detail to decompose your experience and identify your capabilities."
          : "That gives a clear sense of the initiative. To understand your personal contribution: What was the single biggest obstacle or unexpected issue that occurred, and how did you resolve it?",
        nextQuestion: isSufficient
          ? "Would you like to review the structured tasks and potential skills we've inferred from this experience?"
          : "What specific decisions or coordination tasks did you personally handle when challenges arose?",
        suggestedFollowUpOptions: [
          "I created a schedule and briefed 8 volunteers directly.",
          "I negotiated free venue equipment when our sponsor cancelled.",
        ],
      };
    }

    if (isTech) {
      return {
        knownInformation: ["Created or maintained a technical system or script"],
        unclearPoints: historyLength < 2 ? ["Tools and architecture decisions"] : [],
        missingInformation: historyLength < 2 ? ["Measurable outcome or users affected"] : [],
        contradictoryPoints: [],
        currentStage: isSufficient ? "ready_for_extraction" : "investigating_tasks",
        isSufficientForExtraction: isSufficient,
        contextSummary: "Technical development and problem solving involving independent implementation and debugging.",
        reply: isSufficient
          ? "Your explanation of the problem, tools, and technical decisions is very clear. We have enough information to structure your tasks and extract capabilities."
          : "Building or automating solutions independently requires strong diagnosis. What tools did you choose, and what was the most difficult error or constraint you had to overcome?",
        nextQuestion: isSufficient
          ? "Shall we proceed to review the decomposed tasks and verified skills?"
          : "What specific bottleneck did you diagnose, and what steps did you take to fix it?",
        suggestedFollowUpOptions: [
          "I traced latency bottlenecks and refactored the data query logic.",
          "I wrote a Node.js CLI script that automated our weekly data entry.",
        ],
      };
    }

    return {
      knownInformation: ["Shared a real-world experience draft"],
      unclearPoints: ["Specific personal contribution"],
      missingInformation: ["Tools, challenges, and outcomes"],
      contradictoryPoints: [],
      currentStage: isSufficient ? "ready_for_extraction" : "clarifying_role",
      isSufficientForExtraction: isSufficient,
      contextSummary: "Initial experience description shared.",
      reply: isSufficient
        ? "Thank you for walking me through what you did. We have enough clear signal to structure this into concrete tasks and potential competencies."
        : "Thank you for sharing that. What part of this work did you personally handle, and what tools or resources did you use?",
      nextQuestion: isSufficient
        ? "Are you ready to inspect the extracted tasks and skill suggestions?"
        : "What was your exact personal responsibility, and what was the final result?",
      suggestedFollowUpOptions: [
        "I was the lead coordinator responsible for scheduling and materials.",
        "I handled the hands-on troubleshooting and communicated with stakeholders.",
      ],
    };
  }
}
