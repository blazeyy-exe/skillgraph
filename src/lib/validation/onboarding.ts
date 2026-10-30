import { z } from "zod";
import {
  CURRENT_SITUATIONS,
  EXPERIENCE_CATEGORIES,
  INTEREST_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/lib/constants";

const situationValues = CURRENT_SITUATIONS.map((item) => item.value) as [
  string,
  ...string[],
];
const categoryValues = EXPERIENCE_CATEGORIES.map((item) => item.value) as [
  string,
  ...string[],
];
const interestValues = INTEREST_OPTIONS.map((item) => item.value) as [
  string,
  ...string[],
];
const languageValues = LANGUAGE_OPTIONS.map((item) => item.value) as [
  string,
  ...string[],
];

export const onboardingSchema = z.object({
  preferredName: z.string().trim().min(1, "Preferred name is required.").max(80),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  educationalBackground: z.string().trim().max(500).optional().or(z.literal("")),
  currentSituation: z.enum(situationValues).optional().or(z.literal("")),
  preferredLanguage: z.enum(languageValues).default("en"),
  interests: z.array(z.enum(interestValues)).max(12).default([]),
  experienceCategories: z.array(z.enum(categoryValues)).max(12).default([]),
  goalTitle: z.string().trim().max(160).optional().or(z.literal("")),
  goalDescription: z.string().trim().max(1000).optional().or(z.literal("")),
  complete: z.boolean().default(false),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const profileSettingsSchema = z.object({
  preferredName: z.string().trim().min(1).max(80),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  educationalBackground: z.string().trim().max(500).optional().or(z.literal("")),
  currentSituation: z.enum(situationValues).optional().or(z.literal("")),
  preferredLanguage: z.enum(languageValues),
});
