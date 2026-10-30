import { getWorkspace } from "@/lib/data/workspace";
import { AppShell } from "@/components/app/app-shell";
import { IntegrationBanner } from "@/components/integration-banner";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const workspace = await getWorkspace();
  const displayName =
    workspace.profile?.preferred_name || workspace.email || "Workspace User";

  return (
    <div className="min-h-screen bg-paper text-ink">
      <IntegrationBanner />
      <AppShell name={displayName}>{children}</AppShell>
    </div>
  );
}
