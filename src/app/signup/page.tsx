import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { signUpAction } from "@/app/actions/auth";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { IntegrationBanner } from "@/components/integration-banner";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <IntegrationBanner />
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <AuthForm
            title="Create your account"
            subtitle="Discover what you can do. Prove what you're capable of."
            action={signUpAction}
            submitLabel="Create account"
            fields={[
              {
                name: "preferredName",
                label: "What should we call you?",
                hint: "Your first name or preferred name.",
                autoComplete: "given-name",
                required: true,
              },
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
                hint: "Must be at least 8 characters.",
                autoComplete: "new-password",
                required: true,
              },
            ]}
            footer={
              <p>
                Already have an account?{" "}
                <Link href="/login" className="text-ink underline">
                  Log in
                </Link>
              </p>
            }
          />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
