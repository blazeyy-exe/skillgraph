import { describe, expect, it } from "vitest";
import {
  DecomposedTaskSchema,
  InferredSkillOutputSchema,
  ExtractedExperienceSchema,
  DiscoveryAgentOutputSchema,
} from "@/lib/ai/schemas";
import { DemoAiProvider } from "@/lib/ai/provider";

describe("Phase 2 AI Schemas & Task Decomposition", () => {
  it("validates a structured decomposed task", () => {
    const valid = {
      description: "Coordinated volunteer safety briefings and schedule changes",
      contributionType: "individual",
      actions: ["Created safety checklist", "Briefed team lead"],
      tools: ["Spreadsheet", "Radio"],
      obstacles: ["Weather disruption"],
      outcomes: ["Zero safety incidents recorded"],
    };

    const parsed = DecomposedTaskSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.contributionType).toBe("individual");
      expect(parsed.data.tools).toContain("Radio");
    }
  });

  it("rejects invalid task contribution type", () => {
    const invalid = {
      description: "Handled logistics",
      contributionType: "unknown_category",
    };

    const parsed = DecomposedTaskSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("validates inferred skill schema with confidence constraints", () => {
    const valid = {
      skillCanonicalId: "esco:logistics-planning",
      skillName: "Logistics Planning & Resource Allocation",
      explanation: "Directly coordinated event equipment procurement and venue timing.",
      confidence: 0.85,
    };

    const parsed = InferredSkillOutputSchema.safeParse(valid);
    expect(parsed.success).toBe(true);

    const outOfBoundsConfidence = {
      ...valid,
      confidence: 1.5,
    };
    expect(InferredSkillOutputSchema.safeParse(outOfBoundsConfidence).success).toBe(false);
  });

  it("validates full experience extraction payload", () => {
    const exp = {
      title: "Community Event Management",
      category: "Operations",
      roleOrContribution: "Lead Coordinator",
      tasks: [
        {
          description: "Organized supplies and schedule",
          contributionType: "individual",
          actions: ["Planned agenda"],
          tools: ["Calendar"],
          obstacles: ["Vendor delay"],
          outcomes: ["On-time launch"],
        },
      ],
      inferredSkills: [
        {
          skillCanonicalId: "esco:logistics-planning",
          skillName: "Logistics Planning",
          explanation: "Planned event equipment procurement and timeline.",
          confidence: 0.82,
        },
      ],
    };

    const parsed = ExtractedExperienceSchema.safeParse(exp);
    expect(parsed.success).toBe(true);
  });

  it("DemoAiProvider produces schema-compliant structured outputs", async () => {
    const provider = new DemoAiProvider();
    const result = await provider.generateStructured(
      {
        operation: "discovery",
        promptVersion: "v1.0",
        system: "test system prompt",
        user: "I organized an educational workshop for 150 community students with 8 volunteers.",
        userId: "test-user-id",
      },
      DiscoveryAgentOutputSchema,
    );

    expect(result.data.reply).toBeDefined();
    expect(result.data.followUpQuestions.length).toBeGreaterThan(0);
    expect(result.data.extractedExperience).toBeDefined();
    expect(result.data.extractedExperience?.tasks.length).toBeGreaterThan(0);
    expect(result.data.extractedExperience?.inferredSkills.length).toBeGreaterThan(0);
  });
});
