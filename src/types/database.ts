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

export type Experience = {
  id: string;
  user_id: string;
  title: string;
  narrative: string;
  source: "conversation" | "manual" | "document" | "url" | "image" | "voice";
  status: "draft" | "extracted" | "analyzed" | "archived";
  category: string | null;
  role_or_contribution: string | null;
  occurred_at: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
};

export type ExperienceTask = {
  id: string;
  experience_id: string;
  user_id: string;
  description: string;
  contribution_type: "individual" | "team" | "unknown";
  actions: string[];
  tools: string[];
  obstacles: string[];
  outcomes: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type DiscoveryConversation = {
  id: string;
  user_id: string;
  title: string;
  status: "active" | "completed" | "archived";
  context_snapshot: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type DiscoveryMessage = {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, unknown>;
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
  claims?: SkillClaim[];
};
