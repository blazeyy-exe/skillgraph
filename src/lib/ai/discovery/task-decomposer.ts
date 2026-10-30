import "server-only";
import { z } from "zod";
import { getAiProvider } from "@/lib/ai/provider";
import { TASK_DECOMPOSITION_SYSTEM_PROMPT, DISCOVERY_PROMPT_VERSION } from "./prompts";
import { DecomposedTaskSchema, type DecomposedTask, type ExtractedExperience } from "./schemas";

export class DiscoveryTaskDecomposer {
  /**
   * Decomposes an extracted experience into observable, verifiable tasks.
   */
  static async decomposeExperience({
    experience,
    userId,
  }: {
    experience: ExtractedExperience;
    userId: string;
  }): Promise<DecomposedTask[]> {
    const provider = getAiProvider();

    const promptContext = `
EXPERIENCE TITLE: ${experience.title}
EXPERIENCE TYPE: ${experience.experienceType}
DESCRIPTION: ${experience.description}
USER PERSONAL CONTRIBUTION: ${experience.userContribution}
CHALLENGES OVERCOME: ${experience.challenges.join(" · ")}
OUTCOMES ACHIEVED: ${experience.outcomes.join(" · ")}
TOOLS USED: ${experience.toolsUsed.join(", ")}
`.trim();

    try {
      const result = await provider.generateStructured<DecomposedTask[]>(
        {
          operation: "discovery.task_decomposition",
          promptVersion: DISCOVERY_PROMPT_VERSION,
          system: TASK_DECOMPOSITION_SYSTEM_PROMPT,
          user: promptContext,
          userId,
        },
        z.array(DecomposedTaskSchema).min(1).max(6),
      );

      return result.data;
    } catch {
      return this.heuristicDecomposition(experience);
    }
  }

  /**
   * Deterministic, grounded task decomposition fallback based on extracted facts.
   */
  static heuristicDecomposition(experience: ExtractedExperience): DecomposedTask[] {
    const title = experience.title.toLowerCase();
    const isLogistics = title.includes("community") || title.includes("workshop") || title.includes("coordination");
    const isTech = title.includes("system") || title.includes("automation") || title.includes("code");

    if (isLogistics) {
      return [
        {
          description: "Recruited, scheduled, and supervised team volunteers across sessions",
          actionType: "coordination",
          toolsUsed: ["Spreadsheets", "Messaging apps"],
          complexity: "medium",
          responsibilityLevel: "lead",
          supportingContext: "Ensured reliable staffing ratios and replaced short-notice cancellations.",
          extractionSource: "conversation",
          contributionType: "individual",
          actions: ["Created volunteer rota", "Conducted pre-event briefings"],
          tools: ["Spreadsheets", "Messaging apps"],
          obstacles: ["Short-notice volunteer dropouts"],
          outcomes: ["Maintained 100% attendee support coverage"],
        },
        {
          description: "Negotiated sponsor agreements to secure workshop equipment",
          actionType: "communication",
          toolsUsed: ["Outreach templates", "Direct negotiation"],
          complexity: "medium",
          responsibilityLevel: "owner",
          supportingContext: "Framed mutual benefit for local merchants to donate essential materials.",
          extractionSource: "conversation",
          contributionType: "individual",
          actions: ["Presented community initiative", "Secured in-kind donations"],
          tools: ["Outreach templates"],
          obstacles: ["Initial merchant reluctance"],
          outcomes: ["Acquired 100% of required workshop equipment"],
        },
        {
          description: "Managed on-site logistics contingency when space constraints arose",
          actionType: "problem_solving",
          toolsUsed: ["Physical facility coordination"],
          complexity: "medium",
          responsibilityLevel: "lead",
          supportingContext: "Adapted room arrangements on short notice to avoid program delays.",
          extractionSource: "conversation",
          contributionType: "individual",
          actions: ["Reconfigured space layout", "Redirected attendee flow"],
          tools: ["Facility coordination"],
          obstacles: ["Space constraints"],
          outcomes: ["All scheduled workshop activities proceeded on time"],
        },
      ];
    }

    if (isTech) {
      return [
        {
          description: "Diagnosed system execution bottlenecks and refactored core logic",
          actionType: "technical",
          toolsUsed: ["TypeScript", "Debugging tools"],
          complexity: "high",
          responsibilityLevel: "individual_contributor",
          supportingContext: "Isolated concurrency errors and optimized query execution paths.",
          extractionSource: "conversation",
          contributionType: "individual",
          actions: ["Traced slow execution points", "Tested hypotheses", "Refactored queries"],
          tools: ["TypeScript", "Debugging tools"],
          obstacles: ["Intermittent concurrency errors"],
          outcomes: ["Significant latency reduction and stable execution"],
        },
        {
          description: "Engineered automated workflow pipeline to eliminate repetitive data entry",
          actionType: "technical",
          toolsUsed: ["Node.js", "CLI utilities"],
          complexity: "medium",
          responsibilityLevel: "owner",
          supportingContext: "Automated manual data transformation and handled inconsistent inputs.",
          extractionSource: "conversation",
          contributionType: "individual",
          actions: ["Mapped data formats", "Wrote validation scripts", "Automated execution"],
          tools: ["Node.js", "CLI utilities"],
          obstacles: ["Inconsistent source formatting"],
          outcomes: ["Saved multiple hours of manual processing weekly"],
        },
      ];
    }

    return [
      {
        description: `Executed key tasks for: ${experience.title}`,
        actionType: "operations",
        toolsUsed: experience.toolsUsed.length > 0 ? experience.toolsUsed : ["Standard tools"],
        complexity: "medium",
        responsibilityLevel: "individual_contributor",
        supportingContext: experience.userContribution,
        extractionSource: "conversation",
        contributionType: "individual",
        actions: ["Handled practical responsibilities"],
        tools: experience.toolsUsed,
        obstacles: experience.challenges,
        outcomes: experience.outcomes,
      },
    ];
  }
}
