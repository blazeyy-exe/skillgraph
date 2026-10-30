import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { IntegrationBanner } from "@/components/integration-banner";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function TermsPage() {
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
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Legal</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Terms of Service</h1>

          <div className="mt-8 space-y-6 text-ink-soft leading-relaxed">
            <p>
              Welcome to SkillGraph. By accessing or using our platform, you agree to comply with and be bound by these Terms of Service.
            </p>

            <h2 className="font-serif text-2xl text-ink pt-4">1. Honesty in Experience Claims</h2>
            <p>
              SkillGraph is designed to surface real abilities. You agree to submit honest accounts of your real-world activities, projects, and personal contributions. Fabricating experiences, falsifying evidence documents, or misrepresenting teamwork as solo work undermines the integrity of your Capability Passport.
            </p>

            <h2 className="font-serif text-2xl text-ink pt-4">2. Practical Assessments</h2>
            <p>
              Challenge Lab assessments are calibrated to evaluate demonstrated competency. You agree to complete assessments independently without unauthorized third-party intervention.
            </p>

            <h2 className="font-serif text-2xl text-ink pt-4">3. Acceptable Use</h2>
            <p>
              You agree not to upload malicious files, attempt prompt injections designed to manipulate system evaluations, or probe unauthorized databases.
            </p>

            <h2 className="font-serif text-2xl text-ink pt-4">4. Opportunities</h2>
            <p>
              SkillGraph provides opportunity matching as an informational service. External application decisions remain at the sole discretion of the respective organization.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
