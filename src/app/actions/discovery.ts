"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { processDiscoveryMessage, type DiscoveryResponse } from "@/lib/ai/orchestrator";
import { isDemoMode } from "@/lib/config";
import { revalidatePath } from "next/cache";

export type MessageState = {
  ok: boolean;
  message?: string;
  response?: DiscoveryResponse;
};

export async function sendMessageAction(
  conversationId: string,
  content: string,
): Promise<MessageState> {
  const supabase = await createSupabaseServerClient();
  let userId = "demo-user-id";

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "You must be signed in." };
    }
    userId = user.id;
  } else if (!isDemoMode()) {
    return {
      ok: false,
      message: "Supabase or OpenAI is not configured. See .env.example.",
    };
  }

  if (!content || !content.trim()) {
    return { ok: false, message: "Please enter your experience description." };
  }

  try {
    const result = await processDiscoveryMessage({
      conversationId,
      userMessage: content.trim(),
      userId,
    });

    revalidatePath("/app/discover");
    revalidatePath("/app/experiences");
    revalidatePath("/app");

    return {
      ok: true,
      response: result,
    };
  } catch (err: unknown) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "An error occurred during discovery processing.",
    };
  }
}

export async function reviewClaimAction({
  claimId,
  decision,
  correction,
}: {
  claimId: string;
  decision: "accepted" | "rejected" | "corrected";
  correction?: string;
}): Promise<{ ok: boolean; message: string }> {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "You must be signed in." };
    }

    const updatePayload: Record<string, unknown> = {
      user_review: decision,
      evidence_state: decision === "rejected" ? "unexplored" : decision === "accepted" ? "inferred" : "developing",
    };

    if (decision === "corrected" && correction) {
      updatePayload.inference_explanation = correction;
    }

    const { error } = await supabase
      .from("skill_claims")
      .update(updatePayload)
      .eq("id", claimId)
      .eq("user_id", user.id);

    if (error) {
      return { ok: false, message: error.message };
    }
  }

  revalidatePath("/app/experiences");
  revalidatePath("/app/discover");
  revalidatePath("/app");

  return { ok: true, message: `Claim marked as ${decision}.` };
}

export async function createConversationAction(): Promise<{ ok: boolean; conversationId?: string; message?: string }> {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "You must be signed in." };
    }

    const { data, error } = await supabase
      .from("discovery_conversations")
      .insert({
        user_id: user.id,
        title: "New Capability Discovery",
        status: "active",
      })
      .select("id")
      .single();

    if (error || !data) {
      return { ok: false, message: error?.message || "Failed to create conversation." };
    }

    return { ok: true, conversationId: data.id };
  }

  // Demo mode conversation ID
  return { ok: true, conversationId: `demo-conv-${Date.now()}` };
}
