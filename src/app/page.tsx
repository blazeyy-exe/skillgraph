import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { IntegrationBanner } from "@/components/integration-banner";
import { GraphPreview } from "@/components/marketing/graph-preview";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
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

      <main className="flex-1">
        {/* Section 1: Hero */}
        <section className="border-b border-line px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              Capability Discovery &amp; Intelligence
            </p>
            <h1 className="mt-4 font-serif text-5xl tracking-tight sm:text-6xl md:text-7xl">
              Your abilities go beyond your qualifications.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl">
              Traditional CVs, job titles, and degrees hide what you can actually do.
              SkillGraph uncovers hidden capabilities in your everyday experiences,
              attaches real evidence, verifies them through practical assessment,
              and connects you to real opportunities.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {signedIn ? (
                <Link
                  href="/app"
                  className="rounded-sm bg-accent px-6 py-3 font-medium text-paper-raised transition-colors hover:bg-accent-hover"
                >
                  Enter your workspace
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="rounded-sm bg-accent px-6 py-3 font-medium text-paper-raised transition-colors hover:bg-accent-hover"
                  >
                    Start discovering capabilities
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="rounded-sm border border-line bg-paper-raised px-6 py-3 font-medium text-ink transition-colors hover:border-ink"
                  >
                    See how it works
                  </Link>
                </>
              )}
            </div>
            <p className="mt-4 text-xs text-ink-soft">
              No formal degree or traditional resume required. Built for students, self-taught builders, volunteers, and career changers.
            </p>
          </div>
        </section>

        {/* Section 2: The Problem with Traditional CVs */}
        <section className="border-b border-line px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
                  The Credential Fallacy
                </p>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
                  Traditional resumes measure pedigree, not ability.
                </h2>
                <p className="mt-4 text-ink-soft leading-relaxed">
                  Most people develop deep, transferable competencies outside conventional corporate ladders: organizing community relief, building independent software, resolving supply bottlenecks in a family shop, caring for family, or mastering complex crafts through disciplined self-study.
                </p>
                <p className="mt-3 text-ink-soft leading-relaxed">
                  Traditional recruiting filters throw these away as “unqualified.” SkillGraph replaces credential proxies with a living, verifiable model of your real capabilities.
                </p>
              </div>
              <div className="rounded-sm border border-line bg-paper-raised p-6 shadow-sm">
                <div className="space-y-4 text-sm">
                  <div className="border-b border-line pb-3">
                    <p className="font-semibold text-danger">Traditional CV filter</p>
                    <p className="text-ink-soft mt-1">
                      “Requires 4-year degree and 3 years corporate experience.” Rejects community organizers, self-taught programmers, and caregivers without review.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-ok">The SkillGraph Approach</p>
                    <p className="text-ink-soft mt-1">
                      Deconstructs raw real-world action into tasks, grounds them in standard taxonomy (ESCO/O*NET), tracks proof, and verifies with practical challenges.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: How SkillGraph Discovers Capabilities */}
        <section className="border-b border-line px-4 py-16 sm:py-20 bg-paper-raised">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">The Pipeline</p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
                How real experiences become verifiable capability
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-ink-soft">
                SkillGraph is not a generic chatbot or resume writer. It runs a disciplined evidence-grounded pipeline.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-sm border border-line bg-paper p-5">
                <span className="font-serif text-2xl text-accent">01</span>
                <h3 className="mt-2 font-serif text-xl">Describe Experience</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                  Tell the conversation assistant about what you built, organized, solved, or ran. No corporate jargon needed.
                </p>
              </div>
              <div className="rounded-sm border border-line bg-paper p-5">
                <span className="font-serif text-2xl text-accent">02</span>
                <h3 className="mt-2 font-serif text-xl">Task Decomposition</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                  The intelligence engine breaks the narrative into distinct tasks, distinguishing personal actions from team efforts.
                </p>
              </div>
              <div className="rounded-sm border border-line bg-paper p-5">
                <span className="font-serif text-2xl text-accent">03</span>
                <h3 className="mt-2 font-serif text-xl">Capability Inference</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                  Tasks map to structured skills with clear explanations. You review, confirm, correct, or reject every inference.
                </p>
              </div>
              <div className="rounded-sm border border-line bg-paper p-5">
                <span className="font-serif text-2xl text-accent">04</span>
                <h3 className="mt-2 font-serif text-xl">Practical Verification</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                  Challenge Lab assesses inferred skills against standardized rubrics. Skills advance to “Demonstrated” only through proof.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Experience-to-Skill Transformation Demonstration */}
        <section className="border-b border-line px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Demonstration</p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
                From everyday narrative to structured capability
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-sm border border-line bg-paper-raised p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">User Experience</p>
                <blockquote className="mt-3 text-sm italic text-ink leading-relaxed">
                  “I ran a community education workshop for 150 local students on weekends. I had to convince local shopkeepers to sponsor supplies, manage 8 high school volunteers, schedule classes, and deal with power outages during sessions.”
                </blockquote>
              </div>
              <div className="rounded-sm border border-line bg-paper-raised p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">Decomposed Tasks</p>
                <ul className="mt-3 space-y-2 text-xs text-ink-soft">
                  <li className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span>Negotiated community sponsor agreements for supplies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span>Recruited, scheduled, and supervised volunteer team</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span>Formulated curriculum timeline for 150 learners</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span>Implemented emergency contingency during facility power cuts</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-sm border border-line bg-paper-raised p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-ok">Inferred Capabilities</p>
                <div className="mt-3 space-y-2">
                  <div className="rounded border border-line bg-paper p-2 text-xs">
                    <p className="font-medium text-ink">Volunteer Coordination</p>
                    <p className="text-[11px] text-ink-soft">State: Inferred · Confidence: 0.88</p>
                  </div>
                  <div className="rounded border border-line bg-paper p-2 text-xs">
                    <p className="font-medium text-ink">Operational Crisis Management</p>
                    <p className="text-[11px] text-ink-soft">State: Inferred · Confidence: 0.82</p>
                  </div>
                  <div className="rounded border border-line bg-paper p-2 text-xs">
                    <p className="font-medium text-ink">Stakeholder Outreach &amp; Negotiation</p>
                    <p className="text-[11px] text-ink-soft">State: Inferred · Confidence: 0.79</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Interactive Skill Graph Preview */}
        <section className="border-b border-line px-4 py-16 sm:py-20 bg-paper-raised">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 max-w-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Living Representation</p>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
                An interconnected graph of what you can do
              </h2>
              <p className="mt-3 text-ink-soft">
                Your capability isn’t a flat list of keywords. It is an evolving graph connecting real experiences to specific tasks, transferable competencies, supporting evidence, and target careers.
              </p>
            </div>
            <GraphPreview />
          </div>
        </section>

        {/* Section 6 & 7: Challenge Lab and Opportunity Engine */}
        <section className="border-b border-line px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl grid gap-8 md:grid-cols-2">
            <div className="rounded-sm border border-line bg-paper-raised p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Challenge Lab</p>
              <h3 className="mt-2 font-serif text-2xl sm:text-3xl">Proof through practice, not test scores</h3>
              <p className="mt-4 text-ink-soft leading-relaxed text-sm">
                How do you prove a skill without a university diploma? Through realistic, scenario-based challenges designed directly from observable workplace behaviors.
              </p>
              <p className="mt-3 text-ink-soft leading-relaxed text-sm">
                Each assessment evaluates responses against strict rubric criteria. No LLM can declare a skill “Demonstrated” without passing defined benchmarks.
              </p>
            </div>
            <div className="rounded-sm border border-line bg-paper-raised p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Opportunity Engine</p>
              <h3 className="mt-2 font-serif text-2xl sm:text-3xl">Opportunities matched to real competence</h3>
              <p className="mt-4 text-ink-soft leading-relaxed text-sm">
                Match with jobs, internships, fellowships, freelance projects, and community roles based on demonstrated abilities and transferable skills.
              </p>
              <p className="mt-3 text-ink-soft leading-relaxed text-sm">
                SkillGraph explains every match: showing what you’ve demonstrated, what transfers, and the exact skill gaps to bridge. No fake job postings or hidden criteria.
              </p>
            </div>
          </div>
        </section>

        {/* Section 8: Privacy & Trust */}
        <section className="border-b border-line px-4 py-16 sm:py-20 bg-paper-raised">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Security &amp; Dignity</p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">You own your data. Always.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-ink-soft leading-relaxed">
              Your personal stories, private documents, and assessment responses belong to you. We do not sell your data, and we do not use your private evidence to train public AI models without explicit consent.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-ink-soft">
              <div className="flex items-center gap-2">
                <span className="text-ok">✓</span> Row-Level Security on all data
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ok">✓</span> Complete data export &amp; deletion
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ok">✓</span> Selective capability sharing
              </div>
            </div>
          </div>
        </section>

        {/* Section 9: Final Call to Action */}
        <section className="px-4 py-20 sm:py-28 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-serif text-4xl sm:text-5xl">Ready to discover what you can do?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft">
              Join SkillGraph today. Map your experiences, prove your competencies, and unlock opportunities.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-sm bg-accent px-6 py-3 font-medium text-paper-raised transition-colors hover:bg-accent-hover"
              >
                Create your account
              </Link>
              <Link
                href="/login"
                className="rounded-sm border border-line bg-paper-raised px-6 py-3 font-medium text-ink transition-colors hover:border-ink"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
