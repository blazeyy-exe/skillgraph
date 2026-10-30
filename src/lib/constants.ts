export const CURRENT_SITUATIONS = [
  { value: "student", label: "Student or in training" },
  { value: "self_taught", label: "Self-taught / independent learner" },
  { value: "employed", label: "In paid work" },
  { value: "informal_work", label: "Informal, freelance, or gig work" },
  { value: "volunteering", label: "Volunteering or community work" },
  { value: "career_change", label: "Changing direction" },
  { value: "building", label: "Building something of my own" },
  { value: "between", label: "Between roles" },
  { value: "other", label: "Something else" },
] as const;

export const EXPERIENCE_CATEGORIES = [
  { value: "community", label: "Community and volunteering" },
  { value: "care", label: "Care and support" },
  { value: "building", label: "Making, building, or repairing" },
  { value: "organising", label: "Organising people or events" },
  { value: "teaching", label: "Teaching or mentoring" },
  { value: "creative", label: "Creative work" },
  { value: "technical", label: "Technical or digital work" },
  { value: "business", label: "Selling, trading, or running something" },
  { value: "operations", label: "Operations and logistics" },
  { value: "research", label: "Research and investigation" },
] as const;

export const INTEREST_OPTIONS = [
  { value: "people", label: "Working with people" },
  { value: "systems", label: "Systems and organisation" },
  { value: "craft", label: "Craft and making" },
  { value: "technology", label: "Technology" },
  { value: "words", label: "Writing and communication" },
  { value: "numbers", label: "Numbers and analysis" },
  { value: "outdoors", label: "Field or outdoor work" },
  { value: "care", label: "Care and wellbeing" },
  { value: "enterprise", label: "Enterprise and ventures" },
] as const;

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "ne", label: "Nepali" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "ar", label: "Arabic" },
  { value: "zh", label: "Chinese" },
  { value: "other", label: "Other" },
] as const;

export const APP_NAV = [
  { href: "/app", label: "Overview", phase: 1, ready: true },
  { href: "/app/discover", label: "Discover", phase: 2, ready: true },
  { href: "/app/experiences", label: "Experiences", phase: 2, ready: true },
  { href: "/app/graph", label: "Skill graph", phase: 3, ready: false },
  { href: "/app/evidence", label: "Evidence", phase: 4, ready: false },
  { href: "/app/challenges", label: "Challenges", phase: 5, ready: false },
  { href: "/app/growth", label: "Growth", phase: 6, ready: false },
  { href: "/app/opportunities", label: "Opportunities", phase: 7, ready: false },
  { href: "/app/profile", label: "Profile", phase: 1, ready: true },
  { href: "/app/settings", label: "Settings", phase: 1, ready: true },
] as const;
