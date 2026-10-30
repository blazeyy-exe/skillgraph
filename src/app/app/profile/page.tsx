import { getWorkspace } from "@/lib/data/workspace";
import { ProfileForm } from "./profile-form";
import { CURRENT_SITUATIONS } from "@/lib/constants";

export default async function ProfilePage() {
  const workspace = await getWorkspace();
  const profile = workspace.profile;
  const preferences = workspace.preferences;

  const situationLabel =
    CURRENT_SITUATIONS.find((s) => s.value === profile?.current_situation)?.label ??
    profile?.current_situation ??
    "Not specified";

  return (
    <div className="space-y-8">
      <div className="border-b border-line pb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Capability Profile</p>
        <h1 className="mt-1 font-serif text-3xl sm:text-4xl">Your Profile &amp; Identity</h1>
        <p className="mt-1 text-ink-soft text-sm">
          Manage your personal details and background information.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Left column: Edit Form */}
        <div className="rounded-sm border border-line bg-paper-raised p-6">
          <h2 className="font-serif text-2xl mb-4">Edit Profile</h2>
          <ProfileForm profile={profile} />
        </div>

        {/* Right column: Current Snapshot */}
        <div className="space-y-6">
          <div className="rounded-sm border border-line bg-paper-raised p-6">
            <h2 className="font-serif text-2xl mb-4">Profile Snapshot</h2>
            <dl className="space-y-3 text-sm">
              <div className="border-b border-line pb-2">
                <dt className="text-xs text-ink-soft uppercase tracking-wider">Account Email</dt>
                <dd className="font-medium text-ink mt-0.5">{workspace.email || "Not configured"}</dd>
              </div>
              <div className="border-b border-line pb-2">
                <dt className="text-xs text-ink-soft uppercase tracking-wider">Current Situation</dt>
                <dd className="font-medium text-ink mt-0.5">{situationLabel}</dd>
              </div>
              <div className="border-b border-line pb-2">
                <dt className="text-xs text-ink-soft uppercase tracking-wider">Location</dt>
                <dd className="font-medium text-ink mt-0.5">{profile?.location || "Not specified"}</dd>
              </div>
              <div className="border-b border-line pb-2">
                <dt className="text-xs text-ink-soft uppercase tracking-wider">Language</dt>
                <dd className="font-medium text-ink mt-0.5 uppercase">{profile?.preferred_language || "en"}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-soft uppercase tracking-wider">Educational Notes</dt>
                <dd className="text-ink mt-0.5 whitespace-pre-wrap">
                  {profile?.educational_background || "None provided (not required)"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-sm border border-line bg-paper-raised p-6">
            <h2 className="font-serif text-2xl mb-2">Selected Interests &amp; Domains</h2>
            <div className="mt-3">
              <p className="text-xs text-ink-soft uppercase tracking-wider mb-1.5">Domains</p>
              <div className="flex flex-wrap gap-1.5">
                {preferences?.experience_categories && preferences.experience_categories.length > 0 ? (
                  preferences.experience_categories.map((c) => (
                    <span
                      key={c}
                      className="rounded bg-paper px-2 py-0.5 text-xs text-ink border border-line"
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-ink-soft">None selected</span>
                )}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-ink-soft uppercase tracking-wider mb-1.5">Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {preferences?.interests && preferences.interests.length > 0 ? (
                  preferences.interests.map((i) => (
                    <span
                      key={i}
                      className="rounded bg-paper px-2 py-0.5 text-xs text-ink border border-line"
                    >
                      {i}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-ink-soft">None selected</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
