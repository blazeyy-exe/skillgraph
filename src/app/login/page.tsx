import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { loginAction } from "@/app/actions/auth";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { IntegrationBanner } from "@/components/integration-banner";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reason?: string }>;
}) {
  const params = await searchParams;
  const next = params.next || "/app";
  const reason = params.reason;

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <IntegrationBanner />
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {reason === "unconfigured" ? (
            <div className="mb-6 rounded-sm border border-line bg-accent-soft p-4 text-sm text-ink">
              <p className="font-semibold">Supabase is not configured yet.</p>
              <p className="mt-1 text-ink-soft">
                To sign in, configure <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{" "}
                <code className="font-mono text-xs">.env.local</code>. See{" "}
                <Link href="/how-it-works#setup" className="underline font-medium">
                  setup instructions
                </Link>
                .
              </p>
            </div>
          ) : null}

          <AuthForm
            title="Log in to SkillGraph"
            subtitle="Access your capability graph, experiences, and opportunities."
            action={loginAction}
            submitLabel="Log in"
            hiddenFields={{ next }}
            fields={[
              {
                name: "email",
                label: "Email address",
                type: "email",
                autoComplete: "email",
                required: true,
              },
              {
                name: "password",
                label: "Password",
                type: "password",
                autoComplete: "current-password",
                required: true,
              },
            ]}
            footer={
              <div className="space-y-2">
                <p>
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-ink underline">
                    Create an account
                  </Link>
                </p>
                <p>
                  <Link href="/forgot-password" className="text-xs text-ink-soft underline hover:text-ink">
                    Forgot your password?
                  </Link>
                </p>
              </div>
            }
          />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
