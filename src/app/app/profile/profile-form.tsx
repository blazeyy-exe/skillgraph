"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea, FormMessage } from "@/components/ui/field";
import { CURRENT_SITUATIONS, LANGUAGE_OPTIONS } from "@/lib/constants";
import type { Profile } from "@/types/database";

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {state ? (
        <FormMessage tone={state.ok ? "ok" : "danger"}>{state.message}</FormMessage>
      ) : null}

      <div>
        <Label htmlFor="preferredName">Preferred name *</Label>
        <Input
          id="preferredName"
          name="preferredName"
          defaultValue={profile?.preferred_name || ""}
          required
        />
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          defaultValue={profile?.location || ""}
          placeholder="e.g. London, Remote, Kathmandu"
        />
      </div>

      <div>
        <Label htmlFor="currentSituation">Current situation</Label>
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
        <Label htmlFor="preferredLanguage">Preferred language</Label>
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

      <div>
        <Label
          htmlFor="educationalBackground"
          hint="Optional. Degrees are never required to prove capability on SkillGraph."
        >
          Educational background
        </Label>
        <Textarea
          id="educationalBackground"
          name="educationalBackground"
          defaultValue={profile?.educational_background || ""}
          className="min-h-20"
        />
      </div>

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
