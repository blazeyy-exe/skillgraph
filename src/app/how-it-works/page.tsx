import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { IntegrationBanner } from "@/components/integration-banner";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HowItWorksPage() {
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
        <div className="mx-auto max-w-4xl">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Process &amp; Methodology</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">How SkillGraph Works</h1>
          <p className="mt-4 text-lg text-ink-soft leading-relaxed">
            SkillGraph is built on a simple conviction: human capability is developed through real action, not credentials. Here is how we transform messy, everyday human experiences into verifiable, portable competence.
          </p>

          <div className="mt-12 space-y-12">
            {/* Step 1 */}
            <div className="border-l-2 border-accent pl-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">Step 1</span>
              <h2 className="mt-1 font-serif text-2xl">Investigative Experience Discovery</h2>
              <p className="mt-2 text-ink-soft leading-relaxed">
                Rather than asking you to summarize your CV or paste job titles, the Discovery Intelligence agent conducts an investigative interview. It asks what you have organized, built, resolved, or cared for. It probes your personal contributions versus team tasks, tools used, obstacles overcome, and real outcomes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="border-l-2 border-line pl-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Step 2</span>
              <h2 className="mt-1 font-serif text-2xl">Task Decomposition &amp; Disambiguation</h2>
              <p className="mt-2 text-ink-soft leading-relaxed">
                Raw narratives are decomposed into concrete, observable actions. The AI does not invent claims. If a detail is ambiguous, it asks for clarification. You review and retain full editorial control over every structured task.
              </p>
            </div>

            {/* Step 3 */}
            <div className="border-l-2 border-line pl-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Step 3</span>
              <h2 className="mt-1 font-serif text-2xl">Standardized Taxonomy Mapping</h2>
              <p className="mt-2 text-ink-soft leading-relaxed">
                Tasks map to standardized competencies grounded in international taxonomies (such as ESCO and O*NET). Every inferred capability comes with an explanation showing why it was identified and what source tasks support it.
              </p>
            </div>

            {/* Step 4 */}
            <div className="border-l-2 border-line pl-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Step 4</span>
              <h2 className="mt-1 font-serif text-2xl">Evidence Attachment &amp; State Tracking</h2>
              <p className="mt-2 text-ink-soft leading-relaxed">
                Attach project links, documents, presentations, or photos into the private Evidence Vault. Capabilities are tracked across four strict states: <strong>Unexplored</strong>, <strong>Inferred</strong>, <strong>Developing</strong>, and <strong>Demonstrated</strong>. An LLM is strictly prohibited from declaring a skill Demonstrated on inference alone.
              </p>
            </div>

            {/* Step 5 */}
            <div className="border-l-2 border-line pl-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Step 5</span>
              <h2 className="mt-1 font-serif text-2xl">Challenge Lab Practical Assessments</h2>
              <p className="mt-2 text-ink-soft leading-relaxed">
                To move from Inferred or Developing to Demonstrated, you complete scenario-based workplace challenges. Responses are evaluated against transparent rubrics with defined criteria.
              </p>
            </div>

            {/* Step 6 */}
            <div className="border-l-2 border-line pl-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Step 6</span>
              <h2 className="mt-1 font-serif text-2xl">Interactive Living Capability Graph</h2>
              <p className="mt-2 text-ink-soft leading-relaxed">
                Explore your personal capability graph. Trace relationships between experiences, tasks, skills, and parent competencies. Identify transferable strengths and discover hidden connections across seemingly unrelated activities.
              </p>
            </div>

            {/* Step 7 */}
            <div className="border-l-2 border-line pl-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Step 7</span>
              <h2 className="mt-1 font-serif text-2xl">Opportunity Matching &amp; Portable Passport</h2>
              <p className="mt-2 text-ink-soft leading-relaxed">
                Find jobs, internships, freelance gigs, and community programs based on demonstrated capabilities. Share a verified, selective Capability Passport with potential employers or collaborators.
              </p>
            </div>
          </div>

          {/* Setup / Developer Configuration Section */}
          <div id="setup" className="mt-16 rounded-sm border border-line bg-paper-raised p-6">
            <h2 className="font-serif text-2xl">Environment &amp; Integration Setup</h2>
            <p className="mt-2 text-sm text-ink-soft">
              SkillGraph operates with honest integration states. To enable database authentication and AI capability features in your environment:
            </p>
            <ol className="mt-4 list-decimal pl-5 space-y-2 text-sm text-ink-soft">
              <li>
                Copy <code className="font-mono text-xs bg-paper px-1 py-0.5">.env.example</code> to{" "}
                <code className="font-mono text-xs bg-paper px-1 py-0.5">.env.local</code>.
              </li>
              <li>
                Provide your Supabase URL (<code className="font-mono text-xs bg-paper px-1 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code>) and Anon Key (<code className="font-mono text-xs bg-paper px-1 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>).
              </li>
              <li>
                Provide your OpenAI API key (<code className="font-mono text-xs bg-paper px-1 py-0.5">OPENAI_API_KEY</code>) to enable the AI intelligence layer.
              </li>
              <li>
                Apply database migrations from <code className="font-mono text-xs bg-paper px-1 py-0.5">supabase/migrations/</code> to your Supabase project.
              </li>
            </ol>
            <div className="mt-6">
              <Link
                href="/signup"
                className="inline-block rounded-sm bg-accent px-4 py-2 text-sm text-paper-raised hover:bg-accent-hover"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
