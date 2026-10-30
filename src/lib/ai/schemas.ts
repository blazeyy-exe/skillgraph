import { z } from "zod";
export * from "./discovery/schemas";

// Legacy exports for backwards compatibility
export const InferredSkillOutputSchema = z.object({
  skillCanonicalId: z.string(),
  skillName: z.string(),
  explanation: z.string().min(10),
  confidence: z.number().min(0).max(1),
});

export type InferredSkillOutput = z.infer<typeof InferredSkillOutputSchema>;

export const DiscoveryAgentOutputSchema = z.object({
  reply: z.string(),
  followUpQuestions: z.array(z.string()).default([]),
  extractedExperience: z.object({
    title: z.string().min(3).max(160),
    category: z.string().min(2).max(80),
    roleOrContribution: z.string().max(200).optional().default(""),
    tasks: z.array(
      z.object({
        description: z.string().min(3).max(300),
        contributionType: z.enum(["individual", "team", "unknown"]).default("individual"),
        actions: z.array(z.string()).default([]),
        tools: z.array(z.string()).default([]),
        obstacles: z.array(z.string()).default([]),
        outcomes: z.array(z.string()).default([]),
      })
    ).min(1),
    inferredSkills: z.array(InferredSkillOutputSchema).default([]),
  }).optional(),
});

export type DiscoveryAgentOutput = z.infer<typeof DiscoveryAgentOutputSchema>;
