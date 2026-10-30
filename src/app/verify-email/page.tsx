import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { IntegrationBanner } from "@/components/integration-banner";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <IntegrationBanner />
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="mx-auto w-full max-w-md rounded-sm border border-line bg-paper-raised p-8 text-center shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Check your inbox</p>
          <h1 className="mt-2 font-serif text-3xl">Verify your email address</h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            We sent a verification link to your email address. Please click the link to confirm your account and begin setting up your capability profile.
          </p>
          <div className="mt-8 border-t border-line pt-6 text-sm">
            <p className="text-ink-soft">
              Didn&apos;t receive an email or using a local test instance?
            </p>
            <p className="mt-2">
              <Link href="/login" className="font-medium text-ink underline">
                Return to log in
              </Link>
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
