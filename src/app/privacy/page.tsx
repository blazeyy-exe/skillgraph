import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { IntegrationBanner } from "@/components/integration-banner";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PrivacyPage() {
  const supabase = await createSupabaseServerClient();
  let signedIn = false;
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = Boolean(user);
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <IntegrationBanner />
      <SiteHeader signedIn={signedIn} />

      <main className="flex-1 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Privacy &amp; Data Ownership</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Privacy Policy</h1>

          <div className="mt-8 space-y-6 text-ink-soft leading-relaxed">
            <p>
              SkillGraph treats your privacy with the utmost seriousness. Because our platform is designed to discover capabilities through real personal experiences and work artifacts, we adhere to strict data ownership principles:
            </p>

            <h2 className="font-serif text-2xl text-ink pt-4">1. You Own Your Data</h2>
            <p>
              All experience narratives, uploaded evidence files, tasks, and assessment evaluations belong exclusively to you. We do not sell your personal data to data brokers or recruiters.
            </p>

            <h2 className="font-serif text-2xl text-ink pt-4">2. Row-Level Security &amp; Private Storage</h2>
            <p>
              Your data is protected by database-level Row Level Security (RLS) in PostgreSQL. Files uploaded to the Evidence Vault are stored in private storage buckets and accessible only via short-lived signed URLs generated for authenticated sessions.
            </p>

            <h2 className="font-serif text-2xl text-ink pt-4">3. No Unauthorized Model Training</h2>
            <p>
              We do not use your private personal stories, uploaded documents, or assessment results to train foundation models without your explicit, opt-in consent.
            </p>

            <h2 className="font-serif text-2xl text-ink pt-4">4. Selective Sharing</h2>
            <p>
              By default, your profile and capability graph are strictly private. You choose whether to generate a public Capability Passport, and you select exactly which skills and evidence items to expose.
            </p>

            <h2 className="font-serif text-2xl text-ink pt-4">5. Account Deletion and Export</h2>
            <p>
              You have the right to export your complete data bundle or request immediate, permanent deletion of your account and all associated storage assets.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
