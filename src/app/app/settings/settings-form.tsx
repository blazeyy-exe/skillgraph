"use client";

import { useActionState } from "react";
import {
  updatePreferencesAction,
  requestPasswordResetAction,
} from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/field";
import type { UserPreferences } from "@/types/database";

export function SettingsForm({ preferences }: { preferences: UserPreferences | null }) {
  const [prefState, prefAction, prefPending] = useActionState(updatePreferencesAction, null);
  const [resetState, resetAction, resetPending] = useActionState(requestPasswordResetAction, null);

  return (
    <div className="space-y-8">
      {/* Privacy & AI Controls */}
      <section className="rounded-sm border border-line bg-paper-raised p-6">
        <h2 className="font-serif text-2xl text-ink">Privacy &amp; AI Intelligence Controls</h2>
        <p className="mt-1 text-xs text-ink-soft">
          Control how your data and experiences are processed on SkillGraph.
        </p>

        <form action={prefAction} className="mt-6 space-y-4">
          {prefState ? (
            <FormMessage tone={prefState.ok ? "ok" : "danger"}>{prefState.message}</FormMessage>
          ) : null}

          <div className="space-y-3">
            <label className="flex items-start gap-3 rounded border border-line bg-paper p-3 text-sm cursor-pointer hover:border-ink">
              <input
                type="checkbox"
                name="aiProcessing"
                defaultChecked={preferences?.ai_processing_opt_in ?? true}
                className="mt-0.5 rounded border-line"
              />
              <div>
                <span className="font-medium text-ink">AI Capability Processing</span>
                <span className="block text-xs text-ink-soft mt-0.5">
                  Allows SkillGraph’s orchestrator to decompose your experiences into tasks and map skills. Disabling this stops AI-assisted inference.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded border border-line bg-paper p-3 text-sm cursor-pointer hover:border-ink">
              <input
                type="checkbox"
                name="modelTraining"
                defaultChecked={preferences?.model_training_consent ?? false}
                className="mt-0.5 rounded border-line"
              />
              <div>
                <span className="font-medium text-ink">Model Training Consent</span>
                <span className="block text-xs text-ink-soft mt-0.5">
                  Explicit opt-in to allow anonymized experience patterns to refine SkillGraph algorithms. Off by default. We never train public foundation models on private personal data.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded border border-line bg-paper p-3 text-sm cursor-pointer hover:border-ink">
              <input
                type="checkbox"
                name="marketingEmail"
                defaultChecked={preferences?.marketing_email_opt_in ?? false}
                className="mt-0.5 rounded border-line"
              />
              <div>
                <span className="font-medium text-ink">Product Updates &amp; Insights</span>
                <span className="block text-xs text-ink-soft mt-0.5">
                  Receive product updates, new challenge announcements, and capability insights via email.
                </span>
              </div>
            </label>
          </div>

          <Button type="submit" disabled={prefPending} className="mt-4">
            {prefPending ? "Saving..." : "Save preferences"}
          </Button>
        </form>
      </section>

      {/* Security & Password */}
      <section className="rounded-sm border border-line bg-paper-raised p-6">
        <h2 className="font-serif text-2xl text-ink">Security &amp; Password</h2>
        <p className="mt-1 text-xs text-ink-soft">
          Update your authentication credentials.
        </p>

        <form action={resetAction} className="mt-4">
          {resetState ? (
            <div className="mb-4">
              <FormMessage tone={resetState.ok ? "ok" : "danger"}>{resetState.message}</FormMessage>
            </div>
          ) : null}
          <Button type="submit" variant="secondary" disabled={resetPending}>
            {resetPending ? "Sending..." : "Send password reset link"}
          </Button>
        </form>
      </section>
    </div>
  );
}
