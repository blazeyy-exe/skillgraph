import { AuthForm } from "@/components/auth/auth-form";
import { updatePasswordAction } from "@/app/actions/auth";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { IntegrationBanner } from "@/components/integration-banner";

export default function UpdatePasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <IntegrationBanner />
      <SiteHeader />

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <AuthForm
            title="Set a new password"
            subtitle="Choose a secure password with at least 8 characters."
            action={updatePasswordAction}
            submitLabel="Update password"
            fields={[
              {
                name: "password",
                label: "New password",
                type: "password",
                autoComplete: "new-password",
                required: true,
              },
              {
                name: "confirmPassword",
                label: "Confirm new password",
                type: "password",
                autoComplete: "new-password",
                required: true,
              },
            ]}
          />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
