import { z } from "zod";

export const ExperienceTypeSchema = z.enum([
  "Community work",
  "Volunteering",
  "Personal projects",
  "Entrepreneurship",
  "Education",
  "Informal work",
  "Employment",
  "Creative work",
  "Family responsibilities",
  "Other",
]);

export type ExperienceType = z.infer<typeof ExperienceTypeSchema>;

export const InterviewStageSchema = z.enum([
  "initial",
  "clarifying_role",
  "investigating_tasks",
  "resolving_challenges",
  "ready_for_extraction",
  "completed",
]);

export type InterviewStage = z.infer<typeof InterviewStageSchema>;

export const TaskComplexitySchema = z.enum(["low", "medium", "high"]);
export const TaskResponsibilityLevelSchema = z.enum([
  "supporting",
  "individual_contributor",
  "lead",
  "owner",
]);

export const TaskActionTypeSchema = z.enum([
  "coordination",
  "communication",
  "technical",
  "analysis",
  "design",
  "operations",
  "problem_solving",
  "teaching",
  "other",
]);

// 1. Interview Analysis Schema
export const InterviewAnalysisSchema = z.object({
  knownInformation: z.array(z.string()).default([]),
  unclearPoints: z.array(z.string()).default([]),
  missingInformation: z.array(z.string()).default([]),
  contradictoryPoints: z.array(z.string()).default([]),
  currentStage: InterviewStageSchema.default("initial"),
  isSufficientForExtraction: z.boolean().default(false),
  contextSummary: z.string().default(""),
  reply: z.string().min(1),
  nextQuestion: z.string().min(1),
  suggestedFollowUpOptions: z.array(z.string()).default([]),
});

export type InterviewAnalysis = z.infer<typeof InterviewAnalysisSchema>;

// Inferred skill output schema (used by legacy and preliminary inference)
export const InferredSkillOutputSchema = z.object({
  skillCanonicalId: z.string(),
  skillName: z.string(),
  explanation: z.string().min(5),
  confidence: z.number().min(0).max(1),
});

export type InferredSkillOutput = z.infer<typeof InferredSkillOutputSchema>;

// 2. Decomposed Task Schema
export const DecomposedTaskSchema = z.object({
  description: z.string().min(3).max(300),
  actionType: TaskActionTypeSchema.optional().default("coordination"),
  toolsUsed: z.array(z.string()).optional().default([]),
  complexity: TaskComplexitySchema.optional().default("medium"),
  responsibilityLevel: TaskResponsibilityLevelSchema.optional().default("individual_contributor"),
  supportingContext: z.string().optional().default(""),
  extractionSource: z.string().optional().default("conversation"),
  // Backward compatibility fields
  contributionType: z.enum(["individual", "team", "unknown"]).optional().default("individual"),
  actions: z.array(z.string()).optional().default([]),
  tools: z.array(z.string()).optional().default([]),
  obstacles: z.array(z.string()).optional().default([]),
  outcomes: z.array(z.string()).optional().default([]),
});

export type DecomposedTask = z.infer<typeof DecomposedTaskSchema>;

// 3. Structured Experience Extraction Schema
export const ExtractedExperienceSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(3).optional().default("Experience extracted from conversation."),
  narrative: z.string().optional(),
  experienceType: ExperienceTypeSchema.optional().default("Other"),
  category: z.string().optional(),
  organizationName: z.string().nullable().optional().default(null),
  startDate: z.string().nullable().optional().default(null),
  endDate: z.string().nullable().optional().default(null),
  userContribution: z.string().optional().default(""),
  roleOrContribution: z.string().max(200).optional().default(""),
  challenges: z.array(z.string()).optional().default([]),
  outcomes: z.array(z.string()).optional().default([]),
  toolsUsed: z.array(z.string()).optional().default([]),
  uncertainties: z.array(z.string()).optional().default([]),
  supportingMessageReferences: z.array(z.string()).optional().default([]),
  tasks: z.array(DecomposedTaskSchema).optional().default([]),
  inferredSkills: z.array(InferredSkillOutputSchema).optional().default([]),
});

export type ExtractedExperience = z.infer<typeof ExtractedExperienceSchema>;

// 4. Preliminary Skill Suggestion Schema
export const SkillSuggestionSchema = z.object({
  suggestedSkillName: z.string().min(2),
  skillDescription: z.string().min(5),
  inferenceExplanation: z.string().min(10),
  supportingEvidence: z.string().min(5),
  confidenceLevel: z.number().min(0).max(1),
  taxonomyReference: z.string().nullable().default(null),
  supportingTaskDescription: z.string().default(""),
  // Backward compatibility fields
  skillCanonicalId: z.string().optional(),
  skillName: z.string().optional(),
  explanation: z.string().optional(),
  confidence: z.number().optional(),
});

export type SkillSuggestion = z.infer<typeof SkillSuggestionSchema>;

// 5. Complete Extraction Pipeline Result
export const DiscoveryExtractionPipelineResultSchema = z.object({
  experience: ExtractedExperienceSchema,
  tasks: z.array(DecomposedTaskSchema).min(1),
  skillSuggestions: z.array(SkillSuggestionSchema).default([]),
});

export type DiscoveryExtractionPipelineResult = z.infer<
  typeof DiscoveryExtractionPipelineResultSchema
>;
