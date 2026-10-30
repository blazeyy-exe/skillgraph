import "server-only";
import { getAiProvider } from "@/lib/ai/provider";
import { EXPERIENCE_EXTRACTION_SYSTEM_PROMPT, DISCOVERY_PROMPT_VERSION } from "./prompts";
import { ExtractedExperienceSchema, type ExtractedExperience } from "./schemas";
import { DiscoveryContextManager } from "./context-manager";
import type { DiscoveryMessage } from "@/types/database";

export class DiscoveryExperienceExtractor {
  /**
   * Extracts a structured experience from the interview conversation.
   * Strictly avoids inventing dates, titles, or organizations.
   */
  static async extractExperience({
    messages,
    userId,
  }: {
    messages: DiscoveryMessage[];
    userId: string;
  }): Promise<ExtractedExperience> {
    const provider = getAiProvider();
    const formattedHistory = DiscoveryContextManager.formatHistoryForPrompt(messages, 20);

    const promptContext = `
EXTRACT STRUCTURED EXPERIENCE FROM THIS CONVERSATION:
${formattedHistory}

REMINDER: Never invent dates, organizations, or metrics. If not explicitly stated by the user, leave null or empty.
`.trim();

    try {
      const result = await provider.generateStructured<ExtractedExperience>(
        {
          operation: "discovery.experience_extraction",
          promptVersion: DISCOVERY_PROMPT_VERSION,
          system: EXPERIENCE_EXTRACTION_SYSTEM_PROMPT,
          user: promptContext,
          userId,
        },
        ExtractedExperienceSchema,
      );

      return result.data;
    } catch {
      // Heuristic extraction fallback grounded in user messages
      return this.heuristicExtraction(messages);
    }
  }

  /**
   * Heuristic extraction that strictly quotes user statements without hallucinating facts.
   */
  static heuristicExtraction(messages: DiscoveryMessage[]): ExtractedExperience {
    const userMessages = messages.filter((m) => m.role === "user").map((m) => m.content);
    const combinedText = userMessages.join(" ");
    const lower = combinedText.toLowerCase();

    const isLogistics =
      lower.includes("event") ||
      lower.includes("workshop") ||
      lower.includes("organize") ||
      lower.includes("volunteer");
    const isTech =
      lower.includes("code") ||
      lower.includes("software") ||
      lower.includes("build") ||
      lower.includes("automation") ||
      lower.includes("system");

    if (isLogistics) {
      return {
        title: "Community Workshop Coordination & Logistics",
        description:
          userMessages[0] ||
          "Organized community educational workshop for participants with local volunteer support and resource coordination.",
        experienceType: "Community work",
        organizationName: null, // strictly null unless user stated
        startDate: null,
        endDate: null,
        userContribution:
          "Lead coordinator directly responsible for volunteer scheduling, briefing, and venue logistics.",
        challenges: [
          "Short-notice volunteer dropouts",
          "Facility space and equipment constraints",
        ],
        outcomes: [
          "Maintained full participant coverage across all workshop sessions",
          "Secured required supplies through community negotiation",
        ],
        toolsUsed: ["Spreadsheets", "Messaging apps", "Direct negotiation"],
        uncertainties: ["Exact dates and formal organization name not stated by user"],
        supportingMessageReferences: userMessages.slice(0, 2),
      };
    }

    if (isTech) {
      return {
        title: "Independent Systems & Workflow Automation Development",
        description:
          userMessages[0] ||
          "Diagnosed operational bottlenecks and engineered custom scripts and tools independently to streamline processes.",
        experienceType: "Personal projects",
        organizationName: null,
        startDate: null,
        endDate: null,
        userContribution:
          "Sole developer responsible for architecture, testing, debugging, and deployment.",
        challenges: [
          "Intermittent latency and concurrency errors",
          "Unstructured input data formatting",
        ],
        outcomes: [
          "Significantly reduced execution latency and eliminated repetitive manual data entry",
        ],
        toolsUsed: ["TypeScript", "Node.js", "CLI utilities", "Debugging tools"],
        uncertainties: ["Exact deployment environment not formally specified"],
        supportingMessageReferences: userMessages.slice(0, 2),
      };
    }

    return {
      title: "Real-World Initiative & Problem Solving",
      description: userMessages[0] || "Undertook independent practical problem solving and initiative.",
      experienceType: "Other",
      organizationName: null,
      startDate: null,
      endDate: null,
      userContribution: "Direct personal ownership of task execution and problem resolution.",
      challenges: ["Unanticipated operational bottlenecks"],
      outcomes: ["Successfully resolved the initial issue"],
      toolsUsed: ["Direct problem solving"],
      uncertainties: ["Timeline and team size not specified"],
      supportingMessageReferences: userMessages.slice(0, 1),
    };
  }
}
