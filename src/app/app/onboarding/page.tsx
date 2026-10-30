import { getWorkspace } from "@/lib/data/workspace";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const workspace = await getWorkspace();

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Welcome to SkillGraph</p>
        <h1 className="mt-1 font-serif text-3xl sm:text-4xl">Set Up Your Profile</h1>
        <p className="mt-2 text-ink-soft text-sm">
          Tell us a bit about your background, interests, and goals. You can skip any optional field and return to change these anytime.
        </p>
      </div>

      <OnboardingForm workspace={workspace} />
    </div>
  );
}
