import { describe, expect, it } from "vitest";
import { onboardingSchema, profileSettingsSchema } from "@/lib/validation/onboarding";

describe("Onboarding & Profile Validation Schemas", () => {
  it("validates full onboarding payload", () => {
    const input = {
      preferredName: "Alex Rivera",
      location: "Bristol, UK",
      educationalBackground: "Self-taught developer, high school diploma",
      currentSituation: "self_taught",
      preferredLanguage: "en",
      interests: ["technology", "craft"],
      experienceCategories: ["building", "technical"],
      goalTitle: "Build production web services",
      goalDescription: "Transition from personal side-projects to professional software engineering.",
      complete: true,
    };

    const result = onboardingSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.preferredName).toBe("Alex Rivera");
      expect(result.data.complete).toBe(true);
    }
  });

  it("permits educational background to be omitted (never required)", () => {
    const input = {
      preferredName: "Maya",
      location: "",
      educationalBackground: "",
      currentSituation: "informal_work",
      preferredLanguage: "en",
      interests: [],
      experienceCategories: [],
      goalTitle: "",
      goalDescription: "",
      complete: false,
    };

    const result = onboardingSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("profileSettingsSchema updates profile fields correctly", () => {
    const valid = profileSettingsSchema.safeParse({
      preferredName: "Robin",
      location: "Toronto",
      educationalBackground: "",
      currentSituation: "employed",
      preferredLanguage: "fr",
    });
    expect(valid.success).toBe(true);

    const invalid = profileSettingsSchema.safeParse({
      preferredName: "",
      location: "Toronto",
      educationalBackground: "",
      currentSituation: "employed",
      preferredLanguage: "fr",
    });
    expect(invalid.success).toBe(false);
  });
});
