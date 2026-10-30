import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { IntegrationBanner } from "@/components/integration-banner";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AboutPage() {
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
          <p className="text-xs uppercase tracking-[0.2em] text-accent">About SkillGraph</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">Our Mission</h1>

          <div className="mt-8 space-y-6 text-lg leading-relaxed text-ink-soft">
            <p>
              We believe that human competence is vast, diverse, and fundamentally undervalued by the 20th-century credentialing apparatus.
            </p>
            <p>
              Traditional hiring relies on blunt proxies: where you went to school, what titles your previous employers assigned to you, and which commercial certificates you purchased. These proxies systematically exclude self-taught builders, community volunteers, people with informal work history, independent makers, caregivers, and people without formal degrees.
            </p>
            <p className="font-serif text-2xl text-ink italic">
              “Your abilities go beyond your qualifications.”
            </p>
            <p>
              SkillGraph is an AI-powered capability discovery, assessment, and opportunity platform. It is engineered to give every individual an evidence-backed, rigorous way to map what they can actually do, prove it with practical assessment, and discover opportunities where their real abilities are valued.
            </p>
            <h2 className="font-serif text-3xl text-ink pt-6">Who SkillGraph is For</h2>
            <ul className="list-disc pl-6 space-y-2 text-base text-ink-soft">
              <li>Students and young people entering the workforce without extensive employment histories.</li>
              <li>Self-taught developers, designers, writers, and technicians who learned independently.</li>
              <li>Community organizers, event planners, and volunteers whose real leadership goes uncredited.</li>
              <li>Independent creators, artisans, and small business owners.</li>
              <li>Career changers looking to identify and demonstrate transferable capabilities.</li>
              <li>Individuals with disabilities or non-linear life pathways.</li>
            </ul>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
