import { describe, expect, it } from "vitest";
import { getIntegrationStatuses, isDemoMode } from "@/lib/config";

describe("Configuration and Integration Status", () => {
  it("reports integration status accurately", () => {
    const statuses = getIntegrationStatuses();
    expect(statuses).toHaveLength(2);

    const supabase = statuses.find((s) => s.id === "supabase");
    const openai = statuses.find((s) => s.id === "openai");

    expect(supabase).toBeDefined();
    expect(openai).toBeDefined();
    expect(supabase?.requiredFromPhase).toBe(1);
    expect(openai?.requiredFromPhase).toBe(2);
  });

  it("handles demo mode flag", () => {
    const original = process.env.SKILLGRAPH_DEMO_MODE;
    process.env.SKILLGRAPH_DEMO_MODE = "true";
    expect(isDemoMode()).toBe(true);

    process.env.SKILLGRAPH_DEMO_MODE = "false";
    expect(isDemoMode()).toBe(false);

    process.env.SKILLGRAPH_DEMO_MODE = original;
  });
});
