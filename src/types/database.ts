export type Profile = {
  id: string;
  preferred_name: string | null;
  location: string | null;
  educational_background: string | null;
  current_situation: string | null;
  preferred_language: string;
  onboarding_completed_at: string | null;
  onboarding_step: number;
  is_admin: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UserPreferences = {
  user_id: string;
  interests: string[];
  experience_categories: string[];
  marketing_email_opt_in: boolean;
  ai_processing_opt_in: boolean;
  model_training_consent: boolean;
  created_at: string;
  updated_at: string;
};

export type UserGoal = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: "active" | "paused" | "completed" | "archived";
  target_occupation_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ExperienceType =
  | "Community work"
  | "Volunteering"
  | "Personal projects"
  | "Entrepreneurship"
  | "Education"
  | "Informal work"
  | "Employment"
  | "Creative work"
  | "Family responsibilities"
  | "Other";

export type Experience = {
  id: string;
  user_id: string;
  conversation_id: string | null;
  title: string;
  description: string;
  narrative?: string; // alias for backwards compatibility
  experience_type: ExperienceType;
  category?: string | null; // alias for backwards compatibility
  organization_name: string | null;
  start_date: string | null;
  end_date: string | null;
  user_contribution: string | null;
  role_or_contribution?: string | null; // alias for backwards compatibility
  challenges: string[];
  outcomes: string[];
  tools_used: string[];
  status: "draft" | "extracted" | "analyzed" | "archived";
  occurred_at?: string | null;
  location?: string | null;
  created_at: string;
  updated_at: string;
};

export type ExperienceTask = {
  id: string;
  experience_id: string;
  user_id: string;
  description: string;
  action_type: string;
  tools_used: string[];
  complexity: "low" | "medium" | "high";
  responsibility_level: "supporting" | "individual_contributor" | "lead" | "owner";
  supporting_context: string | null;
  extraction_source: string;
  user_review_status: "pending" | "accepted" | "rejected" | "modified";
  // Backward compatibility fields
  contribution_type?: "individual" | "team" | "unknown";
  actions?: string[];
  tools?: string[];
  obstacles?: string[];
  outcomes?: string[];
  order_index?: number;
  created_at: string;
  updated_at: string;
};

export type InterviewStage =
  | "initial"
  | "clarifying_role"
  | "investigating_tasks"
  | "resolving_challenges"
  | "ready_for_extraction"
  | "completed";

export type DiscoveryConversation = {
  id: string;
  user_id: string;
  title: string;
  status: "active" | "paused" | "completed" | "archived";
  context_summary: string | null;
  current_interview_stage: InterviewStage;
  context_snapshot: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type DiscoveryMessage = {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  structured_metadata: Record<string, unknown>;
  metadata?: Record<string, unknown>; // alias for backwards compatibility
  created_at: string;
};

export type Skill = {
  id: string;
  canonical_id: string;
  name: string;
  description: string;
  category: string;
  observable_behaviours: string[];
  source: string;
  source_ref: string | null;
  created_at: string;
};

export type SkillSuggestion = {
  id: string;
  user_id: string;
  experience_id: string;
  task_id: string | null;
  suggested_skill_name: string;
  skill_description: string;
  inference_explanation: string;
  supporting_evidence: string;
  confidence_level: number;
  review_status: "pending" | "accepted" | "rejected" | "modified";
  taxonomy_reference: string | null;
  created_at: string;
  updated_at: string;
};

export type SkillClaim = {
  id: string;
  user_id: string;
  skill_id: string;
  evidence_state: "unexplored" | "inferred" | "developing" | "demonstrated";
  user_review: "pending" | "accepted" | "rejected" | "corrected";
  evidence_confidence: number;
  proficiency_level: "foundational" | "intermediate" | "advanced" | "expert" | null;
  evidence_coverage: number;
  inference_explanation: string;
  source_experience_ids: string[];
  source_task_ids: string[];
  created_at: string;
  updated_at: string;
  skill?: Skill;
};

export type WorkspaceSnapshot = {
  profile: Profile | null;
  preferences: UserPreferences | null;
  goals: UserGoal[];
  email: string | null;
  experiences?: Experience[];
  tasks?: ExperienceTask[];
  suggestions?: SkillSuggestion[];
  claims?: SkillClaim[];
};
