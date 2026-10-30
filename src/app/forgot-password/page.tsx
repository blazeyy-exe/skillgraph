import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { forgotPasswordAction } from "@/app/actions/auth";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { IntegrationBanner } from "@/components/integration-banner";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <IntegrationBanner />
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <AuthForm
            title="Reset your password"
            subtitle="Enter your email address and we will send you a recovery link."
            action={forgotPasswordAction}
            submitLabel="Send recovery link"
            fields={[
              {
                name: "email",
                label: "Email address",
                type: "email",
                autoComplete: "email",
                required: true,
              },
            ]}
            footer={
              <p>
                Remembered your password?{" "}
                <Link href="/login" className="text-ink underline">
                  Back to log in
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
