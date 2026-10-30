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

export type WorkspaceSnapshot = {
  profile: Profile | null;
  preferences: UserPreferences | null;
  goals: UserGoal[];
  email: string | null;
};
