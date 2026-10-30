import { getIntegrationStatuses, isDemoMode } from "@/lib/config";

export function IntegrationBanner() {
  const statuses = getIntegrationStatuses();
  const missingRequired = statuses.filter((item) => !item.configured && item.requiredFromPhase <= 1);
  const demo = isDemoMode();

  if (!missingRequired.length && !demo) return null;

  return (
    <div className="border-b border-line bg-accent-soft px-4 py-2 text-sm text-ink">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        {missingRequired.length ? (
          <p>
            <strong>Configuration required.</strong>{" "}
            {missingRequired.map((item) => item.label).join(", ")}{" "}
            {missingRequired.length === 1 ? "is" : "are"} not set. Copy{" "}
            <code className="font-mono text-xs">.env.example</code> to{" "}
            <code className="font-mono text-xs">.env.local</code> and follow{" "}
            <a className="underline" href="/how-it-works#setup">
              setup
            </a>
            .
          </p>
        ) : (
          <p>
            <strong>Demo mode is on.</strong> Any fixtures will be labelled. This is not production
            data.
          </p>
        )}
      </div>
    </div>
  );
}
