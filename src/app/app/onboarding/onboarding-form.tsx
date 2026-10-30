"use client";

import { useActionState } from "react";
import { saveOnboardingAction, skipOnboardingAction } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea, FormMessage } from "@/components/ui/field";
import {
  CURRENT_SITUATIONS,
  EXPERIENCE_CATEGORIES,
  INTEREST_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/lib/constants";
import type { WorkspaceSnapshot } from "@/types/database";

export function OnboardingForm({ workspace }: { workspace: WorkspaceSnapshot }) {
  const [state, formAction, pending] = useActionState(saveOnboardingAction, null);
  const profile = workspace.profile;
  const preferences = workspace.preferences;
  const activeGoal = workspace.goals[0];

  const selectedInterests = new Set(preferences?.interests || []);
  const selectedCategories = new Set(preferences?.experience_categories || []);

  return (
    <div className="space-y-8 max-w-2xl">
      <form action={formAction} className="space-y-8">
        {state ? (
          <FormMessage tone={state.ok ? "ok" : "danger"}>{state.message}</FormMessage>
        ) : null}

        {/* Section 1: Basic Identity */}
        <section className="rounded-sm border border-line bg-paper-raised p-6 space-y-4">
          <h2 className="font-serif text-2xl text-ink">1. About You</h2>
          <div>
            <Label htmlFor="preferredName" hint="What should we call you?">
              Preferred name *
            </Label>
            <Input
              id="preferredName"
              name="preferredName"
              defaultValue={profile?.preferred_name || ""}
              required
            />
          </div>

          <div>
            <Label htmlFor="location" hint="City, country, or region (optional).">
              Location
            </Label>
            <Input
              id="location"
              name="location"
              defaultValue={profile?.location || ""}
              placeholder="e.g. Kathmandu, London, Remote"
            />
          </div>

          <div>
            <Label htmlFor="preferredLanguage" hint="Language for assessments and discovery.">
              Preferred language
            </Label>
            <Select
              id="preferredLanguage"
              name="preferredLanguage"
              defaultValue={profile?.preferred_language || "en"}
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </Select>
          </div>
        </section>

        {/* Section 2: Current Situation & Education */}
        <section className="rounded-sm border border-line bg-paper-raised p-6 space-y-4">
          <h2 className="font-serif text-2xl text-ink">2. Your Current Situation</h2>
          <div>
            <Label htmlFor="currentSituation" hint="Helps calibrate opportunity suggestions.">
              What best describes your current position?
            </Label>
            <Select
              id="currentSituation"
              name="currentSituation"
              defaultValue={profile?.current_situation || "self_taught"}
            >
              {CURRENT_SITUATIONS.map((sit) => (
                <option key={sit.value} value={sit.value}>
                  {sit.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label
              htmlFor="educationalBackground"
              hint="Optional. You do not need formal degrees or certificates to demonstrate capability."
            >
              Educational background (Optional)
            </Label>
            <Textarea
              id="educationalBackground"
              name="educationalBackground"
              defaultValue={profile?.educational_background || ""}
              placeholder="e.g. Self-taught web developer; completed high school; independent reader..."
              className="min-h-20"
            />
          </div>
        </section>

        {/* Section 3: Experience Categories & Interests */}
        <section className="rounded-sm border border-line bg-paper-raised p-6 space-y-4">
          <h2 className="font-serif text-2xl text-ink">3. Where Do You Have Experience?</h2>
          <p className="text-sm text-ink-soft">
            Select the domains where you have built, organized, solved, or helped:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {EXPERIENCE_CATEGORIES.map((cat) => (
              <label
                key={cat.value}
                className="flex items-center gap-2 rounded border border-line bg-paper p-2.5 text-xs text-ink cursor-pointer hover:border-ink"
              >
                <input
                  type="checkbox"
                  name="experienceCategories"
                  value={cat.value}
                  defaultChecked={selectedCategories.has(cat.value)}
                  className="rounded border-line"
                />
                <span>{cat.label}</span>
              </label>
            ))}
          </div>

          <p className="text-sm text-ink-soft pt-4">What areas interest you most?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {INTEREST_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 rounded border border-line bg-paper p-2.5 text-xs text-ink cursor-pointer hover:border-ink"
              >
                <input
                  type="checkbox"
                  name="interests"
                  value={opt.value}
                  defaultChecked={selectedInterests.has(opt.value)}
                  className="rounded border-line"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Section 4: Goal */}
        <section className="rounded-sm border border-line bg-paper-raised p-6 space-y-4">
          <h2 className="font-serif text-2xl text-ink">4. Your Next Horizon</h2>
          <div>
            <Label
              htmlFor="goalTitle"
              hint="A role, project, transition, or competency you want to reach."
            >
              Primary goal
            </Label>
            <Input
              id="goalTitle"
              name="goalTitle"
              defaultValue={activeGoal?.title || ""}
              placeholder="e.g. Become a junior backend developer, launch a community cooperative"
            />
          </div>

          <div>
            <Label htmlFor="goalDescription" hint="Optional details on why this goal matters to you.">
              Goal notes
            </Label>
            <Textarea
              id="goalDescription"
              name="goalDescription"
              defaultValue={activeGoal?.description || ""}
              placeholder="e.g. Want to turn practical self-study into a recognized, verifiable role."
              className="min-h-20"
            />
          </div>
        </section>

        {/* Submission Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button
            type="submit"
            name="complete"
            value="true"
            disabled={pending}
            className="w-full sm:w-auto"
          >
            {pending ? "Saving..." : "Complete onboarding"}
          </Button>

          <Button
            type="submit"
            name="complete"
            value="false"
            variant="secondary"
            disabled={pending}
            className="w-full sm:w-auto"
          >
            Save and finish later
          </Button>
        </div>
      </form>

      {/* Skip action */}
      <form action={skipOnboardingAction} className="border-t border-line pt-4">
        <p className="text-xs text-ink-soft">
          Want to explore directly first?{" "}
          <button
            type="submit"
            className="font-medium text-ink underline hover:text-accent ml-1"
          >
            Skip onboarding for now
          </button>
        </p>
      </form>
    </div>
  );
}
