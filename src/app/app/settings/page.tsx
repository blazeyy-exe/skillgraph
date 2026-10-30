import { getWorkspace } from "@/lib/data/workspace";
import { SettingsForm } from "./settings-form";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const workspace = await getWorkspace();

  return (
    <div className="space-y-8">
      <div className="border-b border-line pb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Account &amp; Security</p>
        <h1 className="mt-1 font-serif text-3xl sm:text-4xl">Settings</h1>
        <p className="mt-1 text-ink-soft text-sm">
          Manage your account security, AI processing options, and privacy preferences.
        </p>
      </div>

      <SettingsForm preferences={workspace.preferences} />

      {/* Account Deletion and Sign Out */}
      <section className="rounded-sm border border-line bg-paper-raised p-6">
        <h2 className="font-serif text-2xl text-ink">Account Actions</h2>
        <p className="mt-1 text-xs text-ink-soft">
          Sign out of this session or manage your account lifecycle.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <form action={logoutAction}>
            <Button type="submit" variant="secondary">
              Sign out of workspace
            </Button>
          </form>
        </div>

        <div className="mt-8 border-t border-line pt-4 text-xs text-ink-soft">
          <p className="font-medium text-ink">Account Deletion &amp; Data Portability</p>
          <p className="mt-1">
            SkillGraph honors complete account deletion and data export requests in compliance with our privacy principles. To permanently wipe your account and all associated storage records, contact support or use the data management tools in your profile.
          </p>
        </div>
      </section>
    </div>
  );
}
