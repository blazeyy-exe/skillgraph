export type IntegrationId = "supabase" | "openai";

export type IntegrationStatus = {
  id: IntegrationId;
  label: string;
  configured: boolean;
  requiredFromPhase: number;
  missing: string[];
};

function present(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export function isDemoMode(): boolean {
  return process.env.SKILLGRAPH_DEMO_MODE === "true";
}

export function getSupabaseBrowserConfig(): {
  url: string | null;
  anonKey: string | null;
} {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || null,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || null,
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseBrowserConfig();
  return Boolean(url && anonKey);
}

export function isOpenAiConfigured(): boolean {
  return present(process.env.OPENAI_API_KEY);
}

export function hasServiceRoleKey(): boolean {
  return present(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getIntegrationStatuses(): IntegrationStatus[] {
  const supabaseMissing: string[] = [];
  if (!present(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    supabaseMissing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!present(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    supabaseMissing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const openaiMissing: string[] = [];
  if (!present(process.env.OPENAI_API_KEY)) {
    openaiMissing.push("OPENAI_API_KEY");
  }

  return [
    {
      id: "supabase",
      label: "Supabase (auth, database, storage)",
      configured: supabaseMissing.length === 0,
      requiredFromPhase: 1,
      missing: supabaseMissing,
    },
    {
      id: "openai",
      label: "OpenAI (capability intelligence)",
      configured: openaiMissing.length === 0,
      requiredFromPhase: 2,
      missing: openaiMissing,
    },
  ];
}
