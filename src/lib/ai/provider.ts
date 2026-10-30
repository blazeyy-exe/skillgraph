import type { ZodType } from "zod";
import { isDemoMode } from "@/lib/config";
import { log } from "@/lib/logging";

export class AiUnconfiguredError extends Error {
  constructor(message = "The AI provider is not configured.") {
    super(message);
    this.name = "AiUnconfiguredError";
  }
}

export type StructuredGenerateRequest = {
  operation: string;
  promptVersion: string;
  system: string;
  user: string;
  userId: string;
};

export type AiResult<T> = {
  data: T;
  model: string;
  promptTokens: number;
  completionTokens: number;
};

export interface AiProvider {
  id: string;
  generateStructured<T>(
    input: StructuredGenerateRequest,
    schema: ZodType<T>,
  ): Promise<AiResult<T>>;
}

export class OpenAiProvider implements AiProvider {
  id = "openai";

  async generateStructured<T>(
    input: StructuredGenerateRequest,
    schema: ZodType<T>,
  ): Promise<AiResult<T>> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new AiUnconfiguredError("OPENAI_API_KEY is not configured.");
    }

    const model = process.env.OPENAI_MODEL_FAST || "gpt-4o-mini";

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: input.system },
            { role: "user", content: input.user },
          ],
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        log.error("openai_api_error", { status: response.status, body: errorText });
        throw new Error(`OpenAI error (${response.status}): ${errorText}`);
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from AI model.");
      }

      const parsed = JSON.parse(content);
      const validated = schema.parse(parsed);

      return {
        data: validated,
        model,
        promptTokens: json.usage?.prompt_tokens ?? 0,
        completionTokens: json.usage?.completion_tokens ?? 0,
      };
    } catch (err: unknown) {
      log.error("ai_generation_failed", {
        operation: input.operation,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }
}

export class DemoAiProvider implements AiProvider {
  id = "demo";

  async generateStructured<T>(
    input: StructuredGenerateRequest,
    schema: ZodType<T>,
  ): Promise<AiResult<T>> {
    const prompt = input.user.toLowerCase();

    // Contextual demo response generator based on user input
    let demoPayload: unknown;

    if (input.operation === "discovery") {
      const isLogisticsOrEvent = prompt.includes("event") || prompt.includes("workshop") || prompt.includes("organized") || prompt.includes("community");
      const isTech = prompt.includes("code") || prompt.includes("build") || prompt.includes("software") || prompt.includes("script") || prompt.includes("website");

      if (isLogisticsOrEvent) {
        demoPayload = {
          reply: "I noticed you took direct ownership of community coordination and logistics. To ensure we capture your exact personal contribution versus the team's work, what specific obstacles arose during this initiative, and how did you resolve them?",
          followUpQuestions: [
            "Did you personally negotiate with sponsors or venue coordinators?",
            "How many volunteers did you direct, and what instructions did you create for them?",
          ],
          extractedExperience: {
            title: "Community Workshop Coordination & Logistics",
            category: "Community Organizing",
            roleOrContribution: "Lead organizer and volunteer coordinator",
            tasks: [
              {
                description: "Recruited, briefed, and scheduled team volunteers for sessions",
                contributionType: "individual",
                actions: ["Outlined role descriptions", "Created volunteer schedule", "Conducted briefing"],
                tools: ["Spreadsheets", "Messaging apps"],
                obstacles: ["Short notice volunteer cancellations"],
                outcomes: ["Full volunteer coverage maintained across all sessions"],
              },
              {
                description: "Negotiated sponsor agreements to secure workshop equipment",
                contributionType: "individual",
                actions: ["Contacted local suppliers", "Presented community benefit", "Secured in-kind donations"],
                tools: ["Formal outreach", "Negotiation"],
                obstacles: ["Initial reluctance from local vendors"],
                outcomes: ["100% of required materials sponsored"],
              },
              {
                description: "Managed logistics and on-site contingency when facility issues occurred",
                contributionType: "individual",
                actions: ["Implemented fallback room arrangements", "Coordinated attendee flow"],
                tools: ["Physical facility coordination"],
                obstacles: ["Power and space constraints"],
                outcomes: ["No sessions delayed or cancelled"],
              },
            ],
            inferredSkills: [
              {
                skillCanonicalId: "esco:volunteer-management",
                skillName: "Volunteer Coordination & Management",
                explanation: "Demonstrated direct capability in recruiting, scheduling, and directing volunteer groups under real constraints.",
                confidence: 0.88,
              },
              {
                skillCanonicalId: "esco:logistics-planning",
                skillName: "Logistics Planning & Resource Allocation",
                explanation: "Planned material needs and coordinated vendor timelines to maintain workshop delivery.",
                confidence: 0.84,
              },
              {
                skillCanonicalId: "esco:crisis-management",
                skillName: "Operational Crisis Management",
                explanation: "Handled unexpected facility hurdles without disruption to 150 participants.",
                confidence: 0.81,
              },
            ],
          },
        };
      } else if (isTech) {
        demoPayload = {
          reply: "That demonstrates clear technical initiative. Let's dig deeper: What architectural decisions did you make independently, and what was the most difficult error or bottleneck you had to troubleshoot?",
          followUpQuestions: [
            "What tools or languages did you choose, and why?",
            "What was the measurable outcome or who used the finished system?",
          ],
          extractedExperience: {
            title: "Independent Systems & Automation Development",
            category: "Technical",
            roleOrContribution: "Sole developer and maintainer",
            tasks: [
              {
                description: "Diagnosed system performance bottlenecks and refactored core logic",
                contributionType: "individual",
                actions: ["Traced slow execution points", "Tested optimization hypotheses", "Documented results"],
                tools: ["TypeScript", "Debugging tools"],
                obstacles: ["Intermittent concurrency errors"],
                outcomes: ["Significant latency reduction and stable execution"],
              },
              {
                description: "Designed automated workflow script replacing repetitive manual entry",
                contributionType: "individual",
                actions: ["Mapped manual data path", "Wrote automation pipeline", "Handled edge cases"],
                tools: ["Node.js", "CLI utilities"],
                obstacles: ["Inconsistent input formatting"],
                outcomes: ["Saved 4 hours of weekly manual operations"],
              },
            ],
            inferredSkills: [
              {
                skillCanonicalId: "onet:systems-troubleshooting",
                skillName: "Systems Diagnosis & Troubleshooting",
                explanation: "Isolated system faults and methodically resolved latency issues without external oversight.",
                confidence: 0.89,
              },
              {
                skillCanonicalId: "onet:workflow-automation",
                skillName: "Workflow Automation & Scripting",
                explanation: "Identified operational friction and created reliable automated processing scripts.",
                confidence: 0.86,
              },
              {
                skillCanonicalId: "esco:self-directed-learning",
                skillName: "Self-Directed Skill Acquisition",
                explanation: "Mastered tools and resolved complex technical problems through independent study and practice.",
                confidence: 0.85,
              },
            ],
          },
        };
      } else {
        demoPayload = {
          reply: "Thank you for sharing that experience. To understand your capability in detail: What was your specific personal contribution in this situation, what tools or techniques did you use, and what happened as a direct result of your action?",
          followUpQuestions: [
            "What was the single biggest obstacle you had to resolve?",
            "Were you working alone or coordinating with others?",
          ],
        };
      }
    } else {
      demoPayload = {};
    }

    const validated = schema.parse(demoPayload);
    return {
      data: validated,
      model: "demo-heuristic-orchestrator",
      promptTokens: 120,
      completionTokens: 240,
    };
  }
}

export class UnconfiguredAiProvider implements AiProvider {
  id = "unconfigured";

  async generateStructured<T>(
    input: StructuredGenerateRequest,
    schema: ZodType<T>,
  ): Promise<AiResult<T>> {
    void input;
    void schema;
    throw new AiUnconfiguredError(
      "Set OPENAI_API_KEY in .env.local to enable SkillGraph intelligence. (Or enable SKILLGRAPH_DEMO_MODE=true for local evaluation).",
    );
  }
}

export function getAiProvider(): AiProvider {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAiProvider();
  }
  if (isDemoMode()) {
    return new DemoAiProvider();
  }
  return new UnconfiguredAiProvider();
}
