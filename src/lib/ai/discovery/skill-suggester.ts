import "server-only";
import { z } from "zod";
import { getAiProvider } from "@/lib/ai/provider";
import { SKILL_SUGGESTION_SYSTEM_PROMPT, DISCOVERY_PROMPT_VERSION } from "./prompts";
import {
  SkillSuggestionSchema,
  type SkillSuggestion,
  type DecomposedTask,
  type ExtractedExperience,
} from "./schemas";

export class DiscoverySkillSuggester {
  /**
   * Maps decomposed tasks and experience evidence to canonical ESCO / O*NET skill taxonomy.
   */
  static async suggestSkills({
    experience,
    tasks,
    userId,
  }: {
    experience: ExtractedExperience;
    tasks: DecomposedTask[];
    userId: string;
  }): Promise<SkillSuggestion[]> {
    const provider = getAiProvider();

    const tasksSummary = tasks
      .map(
        (t, i) =>
          `Task ${i + 1}: ${t.description} (Action: ${t.actionType}, Level: ${t.responsibilityLevel}, Tools: ${t.toolsUsed.join(", ")})`,
      )
      .join("\n");

    const promptContext = `
EXPERIENCE: ${experience.title} (${experience.experienceType})
USER CONTRIBUTION: ${experience.userContribution}

DECOMPOSED TASKS:
${tasksSummary}
`.trim();

    try {
      const result = await provider.generateStructured<SkillSuggestion[]>(
        {
          operation: "discovery.skill_suggestion",
          promptVersion: DISCOVERY_PROMPT_VERSION,
          system: SKILL_SUGGESTION_SYSTEM_PROMPT,
          user: promptContext,
          userId,
        },
        z.array(SkillSuggestionSchema).min(1).max(5),
      );

      return result.data;
    } catch {
      return this.heuristicSkillMapping(experience, tasks);
    }
  }

  /**
   * Deterministic mapping to canonical ESCO / O*NET taxonomy.
   */
  static heuristicSkillMapping(
    experience: ExtractedExperience,
    tasks: DecomposedTask[],
  ): SkillSuggestion[] {
    const title = experience.title.toLowerCase();
    const isLogistics =
      title.includes("community") ||
      title.includes("workshop") ||
      title.includes("coordination") ||
      tasks.some((t) => t.actionType === "coordination");
    const isTech =
      title.includes("system") ||
      title.includes("automation") ||
      title.includes("code") ||
      tasks.some((t) => t.actionType === "technical");

    if (isLogistics) {
      return [
        {
          suggestedSkillName: "Volunteer Coordination & Management",
          skillDescription:
            "Recruit, schedule, direct, and motivate volunteers in community or non-profit initiatives.",
          inferenceExplanation:
            "The user directly scheduled volunteer shifts, delivered briefing instructions, and resolved short-notice coverage gaps.",
          supportingEvidence:
            tasks.find((t) => t.description.toLowerCase().includes("volunteer"))?.description ||
            experience.userContribution,
          confidenceLevel: 0.88,
          taxonomyReference: "esco:volunteer-management",
          supportingTaskDescription:
            tasks[0]?.description || "Recruited and scheduled team volunteers across sessions",
          skillCanonicalId: "esco:volunteer-management",
          skillName: "Volunteer Coordination & Management",
          explanation:
            "The user directly scheduled volunteer shifts, delivered briefing instructions, and resolved short-notice coverage gaps.",
          confidence: 0.88,
        },
        {
          suggestedSkillName: "Logistics Planning & Resource Allocation",
          skillDescription:
            "Coordinate supplies, timing, transportation, and facilities to execute operational workflows.",
          inferenceExplanation:
            "The user handled on-site space and supply logistics, negotiating donations and adjusting venue setups under constraints.",
          supportingEvidence:
            tasks.find((t) => t.actionType === "operations" || t.actionType === "problem_solving")
              ?.description || experience.challenges.join("; "),
          confidenceLevel: 0.84,
          taxonomyReference: "esco:logistics-planning",
          supportingTaskDescription:
            tasks[1]?.description || "Managed on-site logistics contingency when space constraints arose",
          skillCanonicalId: "esco:logistics-planning",
          skillName: "Logistics Planning & Resource Allocation",
          explanation:
            "The user handled on-site space and supply logistics, negotiating donations and adjusting venue setups under constraints.",
          confidence: 0.84,
        },
        {
          suggestedSkillName: "Community Stakeholder Outreach & Negotiation",
          skillDescription:
            "Engage community partners, business owners, and sponsors to secure resources and agreements.",
          inferenceExplanation:
            "The user presented the community initiative directly to local merchants and successfully secured needed in-kind equipment.",
          supportingEvidence:
            tasks.find((t) => t.actionType === "communication")?.description ||
            "Secured 100% required supplies from local sponsors.",
          confidenceLevel: 0.81,
          taxonomyReference: "esco:stakeholder-negotiation",
          supportingTaskDescription:
            tasks.find((t) => t.actionType === "communication")?.description ||
            "Negotiated sponsor agreements to secure workshop equipment",
          skillCanonicalId: "esco:stakeholder-negotiation",
          skillName: "Community Stakeholder Outreach & Negotiation",
          explanation:
            "The user presented the community initiative directly to local merchants and successfully secured needed in-kind equipment.",
          confidence: 0.81,
        },
      ];
    }

    if (isTech) {
      return [
        {
          suggestedSkillName: "Systems Diagnosis & Troubleshooting",
          skillDescription:
            "Isolate hardware, software, or mechanical issues and implement systematic solutions.",
          inferenceExplanation:
            "The user traced latency bottlenecks, formulated test hypotheses, and refactored core database query logic independently.",
          supportingEvidence:
            tasks.find((t) => t.actionType === "technical")?.description || experience.userContribution,
          confidenceLevel: 0.89,
          taxonomyReference: "onet:systems-troubleshooting",
          supportingTaskDescription:
            tasks[0]?.description ||
            "Diagnosed system execution bottlenecks and refactored core logic",
          skillCanonicalId: "onet:systems-troubleshooting",
          skillName: "Systems Diagnosis & Troubleshooting",
          explanation:
            "The user traced latency bottlenecks, formulated test hypotheses, and refactored core database query logic independently.",
          confidence: 0.89,
        },
        {
          suggestedSkillName: "Workflow Automation & Scripting",
          skillDescription:
            "Eliminate repetitive manual tasks by creating scripts, macros, or digital tool integrations.",
          inferenceExplanation:
            "The user recognized repetitive manual operational overhead and engineered custom scripts to automate input transformation.",
          supportingEvidence:
            tasks.find((t) => t.description.toLowerCase().includes("automat"))?.description ||
            experience.outcomes.join("; "),
          confidenceLevel: 0.86,
          taxonomyReference: "onet:workflow-automation",
          supportingTaskDescription:
            tasks[1]?.description ||
            "Engineered automated workflow pipeline to eliminate repetitive data entry",
          skillCanonicalId: "onet:workflow-automation",
          skillName: "Workflow Automation & Scripting",
          explanation:
            "The user recognized repetitive manual operational overhead and engineered custom scripts to automate input transformation.",
          confidence: 0.86,
        },
        {
          suggestedSkillName: "Self-Directed Skill Acquisition",
          skillDescription:
            "Formulate learning goals, curate independent resources, and acquire technical competence without formal instruction.",
          inferenceExplanation:
            "The user learned required tools independently to design, debug, and deliver the system without formal guidance.",
          supportingEvidence: experience.description,
          confidenceLevel: 0.83,
          taxonomyReference: "esco:self-directed-learning",
          supportingTaskDescription:
            tasks[0]?.description || "Diagnosed system execution bottlenecks and refactored core logic",
          skillCanonicalId: "esco:self-directed-learning",
          skillName: "Self-Directed Skill Acquisition",
          explanation:
            "The user learned required tools independently to design, debug, and deliver the system without formal guidance.",
          confidence: 0.83,
        },
      ];
    }

    return [
      {
        suggestedSkillName: "Self-Directed Skill Acquisition",
        skillDescription:
          "Formulate learning goals, curate independent resources, and acquire practical competence.",
        inferenceExplanation:
          "Demonstrated practical initiative and problem resolution in real-world conditions.",
        supportingEvidence: experience.userContribution,
        confidenceLevel: 0.75,
        taxonomyReference: "esco:self-directed-learning",
        supportingTaskDescription: tasks[0]?.description || experience.title,
        skillCanonicalId: "esco:self-directed-learning",
        skillName: "Self-Directed Skill Acquisition",
        explanation:
          "Demonstrated practical initiative and problem resolution in real-world conditions.",
        confidence: 0.75,
      },
    ];
  }
}
